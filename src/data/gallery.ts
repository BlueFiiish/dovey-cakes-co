// Dovey Cakes Co. - the cake gallery. 34 real cakes she has made (29 sent 2026-10-22 + 5 from
// June 2026), each cut out onto white. `slug` = src/assets/gallery/<slug>.jpg.

export type CakeTag =
  | "vintage" | "character" | "birthday" | "baby" | "milestone" | "tiered" | "wedding" | "novelty";

export interface GalleryItem {
  slug: string;
  title: string;
  tags: CakeTag[];
  note?: string;
}

export const gallery: GalleryItem[] = [
  { slug: "thirty-flirty-heart", title: "Thirty, Flirty & Thriving", tags: ["vintage", "milestone", "birthday"], note: "Pink and red vintage heart with cherries" },
  { slug: "sagittarius-queen", title: "Sagittarius Queen", tags: ["vintage", "birthday", "novelty"], note: "All-black vintage heart" },
  { slug: "cow-print-first-birthday", title: "Cow Print First Birthday", tags: ["tiered", "birthday", "milestone"], note: "Two tiers, rosettes and a handmade calf" },
  { slug: "leopard-heart", title: "Leopard Heart", tags: ["vintage", "birthday"], note: "Mocha piping, hot-pink script" },
  { slug: "fairy-garden", title: "Fairy Garden", tags: ["vintage", "birthday"], note: "Rosettes, a fairy door and a toadstool" },
  { slug: "hello-kitty-avery", title: "Hello Kitty 'Avery'", tags: ["character", "birthday"], note: "Blush ombre with gold spheres" },
  { slug: "cinnamoroll", title: "Cinnamoroll", tags: ["character", "vintage", "tiered"], note: "Mint and pink two-tier lambeth" },
  { slug: "unicorn-mila", title: "Unicorn 'Mila'", tags: ["character", "tiered", "birthday"], note: "Pastel tiers, rainbow and clouds" },
  { slug: "winnie-the-pooh-oh-baby", title: "Winnie the Pooh 'Oh Baby'", tags: ["character", "baby"], note: "Sculpted honey pot, moss and bees" },
  { slug: "stitch", title: "Stitch", tags: ["character", "birthday"], note: "Lambeth piping with an edible image" },
  { slug: "harry-potter", title: "Harry Potter", tags: ["character", "birthday"], note: "Sorting hat, snitch and wand" },
  { slug: "first-rodeo-sahir", title: "Sahir's First Rodeo", tags: ["tiered", "birthday", "milestone"], note: "Horse topper, boots and rope" },
  { slug: "farm-eduardo", title: "Farm 'Eduardo'", tags: ["tiered", "birthday"], note: "Barn, animals and cow print" },
  { slug: "little-dino-baby-shower", title: "Little Dino Baby Shower", tags: ["baby", "vintage"], note: "Sage and blue with a gingham plaque" },
  { slug: "baptism-cross", title: "Baptism Cross", tags: ["milestone", "baby"], note: "Textured cream, dusty-blue petals, gold cross" },
  { slug: "ivory-rosettes-and-pearls", title: "Ivory Rosettes & Pearls", tags: ["vintage", "wedding"], note: "Cream rosettes, pearl swags, green leaves" },
  { slug: "just-married-heart", title: "'Just Married' Heart", tags: ["wedding", "vintage"], note: "Ivory with hand-piped script" },
  { slug: "orange-roses-and-daisies", title: "Orange Roses & Daisies", tags: ["vintage", "birthday"], note: "Ribbed buttercream with climbing vines" },
  { slug: "chapter-31", title: "Chapter 31", tags: ["vintage", "birthday", "milestone"], note: "Orange and ivory roses, daisy vines" },
  { slug: "peach-heart-21", title: "Peach Vintage Heart", tags: ["vintage", "milestone", "novelty"], note: "Mini bottles and a crown for a 21st" },
  { slug: "pink-bows-and-pearls", title: "Pink Bows & Pearls", tags: ["vintage", "birthday"], note: "Vintage piping with satin bows" },
  { slug: "vintage-pink-heart", title: "Vintage Pink Heart", tags: ["vintage", "birthday"], note: "Rosette border, 'Happy Birthday'" },
  { slug: "cream-vintage-lambeth", title: "Cream Vintage Lambeth", tags: ["vintage"], note: "Pastel piped florals" },
  { slug: "dr-pepper-heart", title: "Dr Pepper Heart", tags: ["vintage", "novelty"], note: "Maroon and cream lambeth, edible logo" },
  { slug: "rip-30-black-heart", title: "'RIP 30' Black Heart", tags: ["novelty", "vintage", "milestone"], note: "All-black lambeth, milestone humor" },
  { slug: "sweet-sixteen-brianna", title: "Sweet Sixteen 'Brianna'", tags: ["tiered", "milestone"], note: "Three tiers, rosettes and fresh florals" },
  { slug: "coco-luna", title: "Coco 'Luna'", tags: ["character", "tiered", "birthday"], note: "Papel picado and a first-birthday topper" },
  { slug: "piplup", title: "Piplup", tags: ["character", "vintage"], note: "Blue and cream lambeth with a sculpted penguin" },
  { slug: "hatchimal-samara", title: "Hatchimal 'Samara'", tags: ["character", "birthday"], note: "Speckled eggs and big blue eyes" },
  { slug: "shrek-beware-ogre", title: "Shrek 'Beware Ogre'", tags: ["character", "birthday", "novelty"], note: "Swamp grass, mushrooms, a wooden sign" },
  { slug: "blippi", title: "Blippi", tags: ["character", "birthday"], note: "Blue with orange suspenders and bow tie" },
  { slug: "super-mario-grayson", title: "Super Mario 'Grayson'", tags: ["character", "birthday"], note: "Mario, stars and mushrooms" },
  { slug: "dragon-ball-z", title: "Dragon Ball Z", tags: ["character", "birthday"], note: "Sheet cake with edible image and dragon balls" },
  { slug: "houston-astros", title: "Houston Astros", tags: ["novelty", "birthday"], note: "Drip cake with the team crest" },
];

export const tagOrder: CakeTag[] = ["vintage", "character", "birthday", "baby", "milestone", "tiered", "wedding", "novelty"];

export const tagLabels: Record<CakeTag, string> = {
  vintage: "Vintage hearts & piping",
  character: "Character",
  birthday: "Birthday",
  baby: "Baby & baptism",
  milestone: "Milestones",
  tiered: "Tiered",
  wedding: "Wedding",
  novelty: "Novelty",
};
