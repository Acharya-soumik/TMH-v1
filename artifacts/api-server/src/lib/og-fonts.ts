/**
 * Lazy-load fonts (TTF) for Satori OG image generation.
 *
 * Uses Barlow family from Google Fonts GitHub repo (guaranteed static TTF).
 * Satori does NOT support woff2 or variable fonts — only static TTF/OTF.
 *
 * The font cache is keyed by (headingFamily, bodyFamily) so swapping the brand
 * fonts via the design tokens table picks up new fonts on next render.
 *
 * The renderer registers the fetched font data under the family names provided
 * by the brand tokens, so token-driven `fontFamily` styles in og-card resolve
 * correctly without any string coupling between tokens and font URLs.
 */

interface CachedFont {
  name: string
  data: ArrayBuffer
  weight: number
  style: "normal"
}

const cache = new Map<string, CachedFont[]>()

const GITHUB_FONTS = "https://raw.githubusercontent.com/google/fonts/main/ofl"

const FONT_URLS = {
  headingBlack: `${GITHUB_FONTS}/barlowcondensed/BarlowCondensed-Black.ttf`,
  bodySemiBold: `${GITHUB_FONTS}/barlow/Barlow-SemiBold.ttf`,
  bodyBold: `${GITHUB_FONTS}/barlow/Barlow-Bold.ttf`,
} as const

export interface LoadFontsOptions {
  headingFamily: string
  bodyFamily: string
}

export async function loadFonts(opts: LoadFontsOptions): Promise<CachedFont[]> {
  const key = `${opts.headingFamily}|${opts.bodyFamily}`
  const cached = cache.get(key)
  if (cached) return cached

  const [headingData, bodySemiBoldData, bodyBoldData] = await Promise.all([
    fetchTtf(FONT_URLS.headingBlack),
    fetchTtf(FONT_URLS.bodySemiBold),
    fetchTtf(FONT_URLS.bodyBold),
  ])

  const fonts: CachedFont[] = [
    { name: opts.headingFamily, data: headingData, weight: 900, style: "normal" },
    { name: opts.bodyFamily, data: bodySemiBoldData, weight: 600, style: "normal" },
    { name: opts.bodyFamily, data: bodyBoldData, weight: 700, style: "normal" },
  ]

  cache.set(key, fonts)
  return fonts
}

async function fetchTtf(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status} ${url}`)
  return res.arrayBuffer()
}
