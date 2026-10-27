// POST /api/cake-idea  { description, occasion?, turnstileToken? }
//   -> { reply, imagePrompt, orderNote, image: "data:image/...;base64,..." | null }
//
// Claude turns the customer's wish into a short reply plus a cake-only image prompt in her
// style (buttercream, hand-piped, the kinds of cakes in the gallery). An image model then
// renders it. Guards, each optional and active only when configured:
//   - Turnstile token check (TURNSTILE_SECRET_KEY)
//   - per-IP rate limit (IDEA_LIMITER ratelimit binding, see wrangler.toml)
//   - daily cap on image generations (IDEA_KV + IDEA_DAILY_CAP)
// Returns 503 until ANTHROPIC_API_KEY exists, which the /cake-ideas/ page shows as "not on yet".
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { bad, clientIp, json, readJson, verifyTurnstile } from '../_lib/http';

interface Env {
  ANTHROPIC_API_KEY?: string;
  IMAGE_PROVIDER?: 'openai' | 'gemini';
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  IDEA_DAILY_CAP?: string;
  IDEA_KV?: KVNamespace;
  IDEA_LIMITER?: { limit: (opts: { key: string }) => Promise<{ success: boolean }> };
}

const Idea = z.object({
  reply: z.string().describe('2-3 warm sentences to the customer describing the cake you imagine, in the baker\'s voice.'),
  image_prompt: z
    .string()
    .describe('A detailed prompt for an image model: one finished cake on a plain white background, no text overlays, no people.'),
  suggested_flavor: z.string().describe('One flavor + filling pairing from the menu that suits the theme.'),
  order_note: z.string().describe('One line the customer can paste into the order form summarizing the design.'),
});

const SYSTEM = `You help customers of Dovey Cakes Co., a home bakery in Rosenberg, Texas, picture a custom cake.
The baker's style: hand-piped buttercream, vintage "lambeth" piping and heart cakes, character cakes with sculpted fondant toppers, tiered birthday cakes, rosettes, pearls, bows, edible images. Flavors: vanilla, chocolate, strawberry, lemon, red velvet, confetti, coffee, carrot, oreo, marble, tres leches. Fillings: fresh fruit, cream cheese, fresas con crema, cookies n cream, chocolate ganache, white chocolate ganache, nutella mousse, peanut butter mousse, bavarian cream, dulce de leche mousse.
Write the image_prompt for a photo of ONE finished cake, studio-lit, on a plain white background, matching her style (buttercream, not fondant-covered unless asked), including colors, shape, tiers, toppers and any name or age text piped on the cake. Keep it realistic and bakeable. No people, no watermarks.
Never promise a price or a date. If the request is not about a cake or dessert, still answer kindly and steer it back to a cake.`;

async function renderImage(prompt: string, env: Env): Promise<string | null> {
  const provider = env.IMAGE_PROVIDER || (env.OPENAI_API_KEY ? 'openai' : env.GEMINI_API_KEY ? 'gemini' : null);
  if (provider === 'openai' && env.OPENAI_API_KEY) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024', quality: 'medium', output_format: 'webp' }),
    });
    const data = (await res.json().catch(() => ({}))) as { data?: { b64_json?: string }[]; error?: { message?: string } };
    if (!res.ok || !data.data?.[0]?.b64_json) {
      console.error('openai image error', res.status, data.error?.message);
      return null;
    }
    return `data:image/webp;base64,${data.data[0].b64_json}`;
  }
  if (provider === 'gemini' && env.GEMINI_API_KEY) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '1:1' } }),
      }
    );
    const data = (await res.json().catch(() => ({}))) as { predictions?: { bytesBase64Encoded?: string; mimeType?: string }[] };
    const p = data.predictions?.[0];
    if (!res.ok || !p?.bytesBase64Encoded) {
      console.error('gemini image error', res.status);
      return null;
    }
    return `data:${p.mimeType || 'image/png'};base64,${p.bytesBase64Encoded}`;
  }
  return null;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.ANTHROPIC_API_KEY) return bad('ideas_not_configured', 503);

  const body = await readJson<{ description?: string; occasion?: string; turnstileToken?: string }>(request);
  const description = (body?.description || '').toString().trim().slice(0, 600);
  const occasion = (body?.occasion || '').toString().trim().slice(0, 80);
  if (description.length < 8) return bad('describe_the_cake');

  const ip = clientIp(request);
  if (!(await verifyTurnstile(body?.turnstileToken, env.TURNSTILE_SECRET_KEY, ip))) return bad('bot_check_failed', 403);
  if (env.IDEA_LIMITER) {
    const { success } = await env.IDEA_LIMITER.limit({ key: ip });
    if (!success) return bad('slow_down', 429);
  }

  // Daily cap on image renders (text replies still work past the cap).
  let imagesAllowed = true;
  const cap = Number(env.IDEA_DAILY_CAP || 100);
  const dayKey = `ideas:${new Date().toISOString().slice(0, 10)}`;
  if (env.IDEA_KV) {
    const used = Number((await env.IDEA_KV.get(dayKey)) || 0);
    imagesAllowed = used < cap;
    if (imagesAllowed) await env.IDEA_KV.put(dayKey, String(used + 1), { expirationTtl: 60 * 60 * 36 });
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  let idea: z.infer<typeof Idea>;
  try {
    const response = await client.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 2048,
      output_config: { effort: 'low', format: zodOutputFormat(Idea) },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: `Occasion: ${occasion || 'not given'}\nWhat they want: ${description}`,
        },
      ],
    });
    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return json({ reply: "I couldn't picture that one. Try describing the colors, the theme and who it's for.", image: null });
    }
    idea = response.parsed_output;
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return bad('busy', 429);
    if (err instanceof Anthropic.APIError) {
      console.error('anthropic error', err.status, err.message);
      return bad('idea_failed', 502);
    }
    throw err;
  }

  const image = imagesAllowed ? await renderImage(idea.image_prompt, env) : null;

  return json({
    reply: idea.reply,
    suggestedFlavor: idea.suggested_flavor,
    orderNote: idea.order_note,
    imagePrompt: idea.image_prompt,
    image,
    imageCapped: !imagesAllowed,
  });
};
