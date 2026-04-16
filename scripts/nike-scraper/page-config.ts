/**
 * Declarative configuration mapping each Nike size-fit page slug
 * to the Fitr data model categories.
 *
 * Pages that map to the same (gender, category) will be merged into
 * one parent BrandSizeChart. Label prefixes prevent size_label collisions.
 */

export interface PageConfig {
  slug: string;
  gender: string;
  category: string;
  prefix: string;
  storable: boolean;
  ageGroup: string;
  notes: string;
}

export const NIKE_PAGES: PageConfig[] = [
  // ── Men's (adult, storable) ──────────────────────────────
  { slug: 'mens-footwear', gender: 'mens', category: 'shoes', prefix: '', storable: true, ageGroup: 'adult', notes: 'Foot length ↔ US size' },
  { slug: 'mens_tops_alpha', gender: 'mens', category: 'tops', prefix: '', storable: true, ageGroup: 'adult', notes: 'Alpha sizes XS–4XL + Tall' },
  { slug: 'mens_bottoms_alpha', gender: 'mens', category: 'bottoms', prefix: '', storable: true, ageGroup: 'adult', notes: 'Alpha bottoms S–4XL' },
  { slug: 'mens-bottoms-numeric', gender: 'mens', category: 'bottoms', prefix: '', storable: true, ageGroup: 'adult', notes: 'Numeric bottoms 28–44' },
  { slug: 'nba-wnba-jerseys', gender: 'mens', category: 'tops', prefix: 'NBA ', storable: true, ageGroup: 'adult', notes: 'Jersey sizing' },
  { slug: 'mens-nba-shorts', gender: 'mens', category: 'bottoms', prefix: 'NBA ', storable: true, ageGroup: 'adult', notes: 'NBA shorts' },
  { slug: 'mens-swimsuit', gender: 'mens', category: 'bottoms', prefix: 'Swim ', storable: true, ageGroup: 'adult', notes: 'Swim trunks' },
  { slug: 'underwear', gender: 'mens', category: 'bottoms', prefix: 'Underwear ', storable: true, ageGroup: 'adult', notes: 'Underwear' },

  // ── Women's (adult, storable) ────────────────────────────
  { slug: 'womens-footwear', gender: 'womens', category: 'shoes', prefix: '', storable: true, ageGroup: 'adult', notes: 'Foot length ↔ US size' },
  { slug: 'womens-tops-alpha', gender: 'womens', category: 'tops', prefix: '', storable: true, ageGroup: 'adult', notes: 'Alpha tops' },
  { slug: 'womens-bottoms-alpha', gender: 'womens', category: 'bottoms', prefix: '', storable: true, ageGroup: 'adult', notes: 'Alpha bottoms' },
  { slug: 'womens-numeric', gender: 'womens', category: 'bottoms', prefix: '', storable: true, ageGroup: 'adult', notes: 'Numeric bottoms' },
  { slug: 'wnba-shorts', gender: 'womens', category: 'bottoms', prefix: 'WNBA ', storable: true, ageGroup: 'adult', notes: 'WNBA shorts' },
  { slug: 'womens-bras', gender: 'womens', category: 'tops', prefix: 'Bra ', storable: true, ageGroup: 'adult', notes: 'Band→waist_cm, Bust→chest_cm' },
  { slug: 'womens-skirt-dress', gender: 'womens', category: 'bottoms', prefix: 'Skirt ', storable: true, ageGroup: 'adult', notes: 'Skirts & dresses' },
  { slug: 'womens-swimsuit', gender: 'womens', category: 'bottoms', prefix: 'Swim ', storable: true, ageGroup: 'adult', notes: 'Swimwear' },
  { slug: 'pro-swim-hijab', gender: 'womens', category: 'tops', prefix: 'Hijab ', storable: true, ageGroup: 'adult', notes: 'Hijab sizing' },

  // ── Unisex (adult, storable) ─────────────────────────────
  { slug: 'unisex-footwear-mens-based', gender: 'unisex', category: 'shoes', prefix: '', storable: true, ageGroup: 'adult', notes: 'Unisex footwear (men\'s-based)' },
  { slug: 'alpha-sized-footwear', gender: 'unisex', category: 'shoes', prefix: 'Alpha ', storable: true, ageGroup: 'adult', notes: 'Alpha-sized footwear S/M/L' },
  { slug: 'gender-neutral-clothing-mens-based-alpha', gender: 'unisex', category: 'tops', prefix: '', storable: true, ageGroup: 'adult', notes: 'Gender-neutral clothing — may have tops+bottoms' },

  // ── Kids (NOT storable — enum doesn't support kids) ──────
  { slug: 'kids-footwear', gender: 'kids_unisex', category: 'shoes', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Multiple age-group tables' },
  { slug: 'boys-clothing', gender: 'kids_boys', category: 'tops', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Boys clothing' },
  { slug: 'boys-swimwear', gender: 'kids_boys', category: 'bottoms', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Boys swim' },
  { slug: 'girls-clothing', gender: 'kids_girls', category: 'tops', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Girls clothing' },
  { slug: 'girls-swimwear', gender: 'kids_girls', category: 'bottoms', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Girls swim' },
  { slug: 'girls-bras', gender: 'kids_girls', category: 'tops', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Girls bras' },
  { slug: 'little-kids-clothing', gender: 'kids_unisex', category: 'tops', prefix: '', storable: false, ageGroup: 'little_kids', notes: 'Little kids 3–7 yrs' },
  { slug: 'infant-toddler-clothing', gender: 'kids_unisex', category: 'tops', prefix: '', storable: false, ageGroup: 'infant_toddler', notes: 'Baby & toddler 0–3 yrs' },
  { slug: 'jordan-big-kids-clothing', gender: 'kids_unisex', category: 'tops', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Jordan big kids' },

  // ── Accessories (NOT storable — enum doesn't support accessories) ──
  { slug: 'belts', gender: 'unisex', category: 'accessories', prefix: '', storable: false, ageGroup: 'adult', notes: 'Belts' },
  { slug: 'hats-and-headwear', gender: 'unisex', category: 'accessories', prefix: '', storable: false, ageGroup: 'adult', notes: 'Hats' },
  { slug: 'kids-hats-and-headwear', gender: 'kids_unisex', category: 'accessories', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Kids hats' },
  { slug: 'kids-socks', gender: 'kids_unisex', category: 'accessories', prefix: '', storable: false, ageGroup: 'big_kids', notes: 'Kids socks' },
  { slug: 'unisex-socks', gender: 'unisex', category: 'accessories', prefix: '', storable: false, ageGroup: 'adult', notes: 'Socks' },
  { slug: 'apple-watch', gender: 'unisex', category: 'accessories', prefix: '', storable: false, ageGroup: 'adult', notes: 'Apple Watch bands' },
];

export const BASE_URL = 'https://www.nike.com/size-fit';
