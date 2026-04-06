/**
 * Lazy-load Google Fonts for Satori OG image generation.
 * Fonts are fetched once on first request and cached in memory.
 */

interface CachedFont {
  name: string
  data: ArrayBuffer
  weight: number
  style: "normal"
}

let fontCache: CachedFont[] | null = null

export async function loadFonts(): Promise<CachedFont[]> {
  if (fontCache) return fontCache

  const fonts = await Promise.all([
    fetchGoogleFont("Barlow Condensed", 900),
    fetchGoogleFont("DM Sans", 600),
    fetchGoogleFont("DM Sans", 700),
  ])

  fontCache = fonts
  return fonts
}

async function fetchGoogleFont(family: string, weight: number): Promise<CachedFont> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
  const cssRes = await fetch(cssUrl, {
    headers: {
      // This user-agent triggers woff2/ttf format URLs in the CSS response
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    },
  })
  const css = await cssRes.text()

  const urlMatch = css.match(/url\(([^)]+)\)/)
  if (!urlMatch) throw new Error(`Could not find font URL for ${family} ${weight}`)

  const fontUrl = urlMatch[1].replace(/['"]/g, "")
  const fontRes = await fetch(fontUrl)
  const data = await fontRes.arrayBuffer()

  return { name: family, data, weight, style: "normal" as const }
}
