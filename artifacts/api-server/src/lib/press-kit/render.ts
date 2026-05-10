/**
 * Press-kit rendering pipeline. Takes a Satori element + size, produces a
 * PNG buffer, uploads to R2, returns the R2 key + public URL.
 */

import { loadFonts } from "../og-fonts.js"
import { getBrandTokens } from "../design-tokens-cache.js"
import { uploadBuffer, R2_PUBLIC_URL } from "../../utils/r2.js"
import { SIZES, type SizeKey } from "./sizes.js"

interface SatoriElement {
  type: string
  props: Record<string, unknown>
}

let _satori: ((element: any, options: any) => Promise<string>) | null = null
let _Resvg: (new (svg: string, options: any) => { render(): { asPng(): Uint8Array } }) | null = null

async function getSatori() {
  if (!_satori) {
    const mod = await import("satori")
    _satori = mod.default
  }
  return _satori!
}

async function getResvg() {
  if (!_Resvg) {
    const mod = await import("@resvg/resvg-js")
    _Resvg = mod.Resvg
  }
  return _Resvg!
}

export async function renderToPng(element: SatoriElement, size: SizeKey): Promise<Buffer> {
  const tokens = await getBrandTokens()
  const [satori, Resvg, fonts] = await Promise.all([
    getSatori(),
    getResvg(),
    loadFonts({ headingFamily: tokens.headingFont, bodyFamily: tokens.bodyFont }),
  ])
  const spec = SIZES[size]

  const svg = await satori(element as any, {
    width: spec.width,
    height: spec.height,
    fonts: fonts.map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
      style: f.style,
    })),
  })

  const resvg = new Resvg(svg, { fitTo: { mode: "width" as const, value: spec.width } })
  const png = resvg.render().asPng()
  return Buffer.from(png)
}

export interface UploadResult {
  r2Key: string
  publicUrl: string
}

export async function uploadAsset(
  buffer: Buffer,
  contentType: string,
  contentId: number,
  template: string,
  size: SizeKey,
): Promise<UploadResult> {
  const r2Key = `press-kit/${contentType}/${contentId}/${template}-${size}.png`
  await uploadBuffer(r2Key, buffer, "image/png")
  const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL.replace(/\/$/, "")}/${r2Key}` : r2Key
  return { r2Key, publicUrl }
}
