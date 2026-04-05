interface ShareCardOptions {
  question: string
  votedOptionText?: string
  votedPct?: number
  totalVotes: number
  category?: string
  options?: Array<{ text: string; percentage: number }>
}

// ──────────────────────────────────────────────────────────────
//  Brand constants
// ──────────────────────────────────────────────────────────────
const BLACK = "#0A0A0A"
const CARD = "#111111"
const WHITE = "#F2EDE4"
const RED = "#DC143C"
const MUTED = "#9A9690"
const BORDER = "#2A2A2A"
const GREEN = "#10B981"

async function waitForFonts() {
  await Promise.race([
    document.fonts.ready,
    new Promise(resolve => setTimeout(resolve, 2000))
  ])
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4
): number {
  const words = text.split(" ")
  let line = ""
  let currentY = y
  let lineCount = 0
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " "
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      if (lineCount >= maxLines - 1) {
        // truncate with ellipsis on final line
        let truncated = line.trim()
        while (ctx.measureText(truncated + "…").width > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        ctx.fillText(truncated + "…", x, currentY)
        return currentY
      }
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + " "
      currentY += lineHeight
      lineCount++
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, currentY)
  return currentY
}

function drawBrandHeader(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  // Red bar mark
  ctx.fillStyle = RED
  ctx.fillRect(x, y - 6 * scale, 44 * scale, 4 * scale)

  // "THE TRIBUNAL"
  ctx.fillStyle = WHITE
  ctx.font = `900 ${28 * scale}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  ctx.textAlign = "left"
  ctx.fillText("THE TRIBUNAL", x, y + 26 * scale)
  // Red period after brand name
  const brandWidth = ctx.measureText("THE TRIBUNAL").width
  ctx.fillStyle = RED
  ctx.fillText(".", x + brandWidth, y + 26 * scale)

  // Tagline
  ctx.font = `600 ${11 * scale}px "DM Sans", Arial, sans-serif`
  ctx.fillStyle = MUTED
  ctx.fillText("BY THE MIDDLE EAST HUSTLE", x, y + 44 * scale)
}

function drawResultsBars(
  ctx: CanvasRenderingContext2D,
  options: Array<{ text: string; percentage: number }>,
  x: number,
  y: number,
  width: number,
  votedOptionText?: string
) {
  const rowHeight = 52
  const barHeight = 10

  options.slice(0, 4).forEach((opt, i) => {
    const rowY = y + i * rowHeight
    const isVoted = opt.text === votedOptionText
    const color = isVoted ? RED : WHITE

    // Label
    ctx.fillStyle = isVoted ? RED : WHITE
    ctx.font = `700 18px "DM Sans", Arial, sans-serif`
    ctx.textAlign = "left"
    const label = opt.text.length > 38 ? opt.text.slice(0, 35) + "…" : opt.text
    ctx.fillText(label, x, rowY)

    // Percentage
    ctx.font = `900 22px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
    ctx.textAlign = "right"
    ctx.fillStyle = color
    ctx.fillText(`${Math.round(opt.percentage)}%`, x + width, rowY)

    // Bar background
    ctx.fillStyle = BORDER
    ctx.fillRect(x, rowY + 12, width, barHeight)

    // Bar fill
    ctx.fillStyle = color
    const fillW = Math.round(width * (Math.max(opt.percentage, 0) / 100))
    ctx.fillRect(x, rowY + 12, fillW, barHeight)
  })

  ctx.textAlign = "left"
}

// ──────────────────────────────────────────────────────────────
//  Open Graph card (1200 × 630)
// ──────────────────────────────────────────────────────────────
export async function generateShareCard(opts: ShareCardOptions): Promise<Blob | null> {
  const W = 1200
  const H = 630
  const PAD = 70

  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  await waitForFonts()

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, W, H)
  gradient.addColorStop(0, BLACK)
  gradient.addColorStop(1, "#121212")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)

  // Subtle diagonal accent stripe in bottom-right corner
  ctx.save()
  ctx.fillStyle = "rgba(220,20,60,0.07)"
  ctx.beginPath()
  ctx.moveTo(W, H - 180)
  ctx.lineTo(W, H)
  ctx.lineTo(W - 180, H)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Top border accent
  ctx.fillStyle = RED
  ctx.fillRect(0, 0, W, 5)

  // Brand header
  drawBrandHeader(ctx, PAD, PAD, 1)

  // Category badge
  if (opts.category) {
    const catText = opts.category.toUpperCase()
    ctx.font = `800 12px "DM Sans", Arial, sans-serif`
    const catWidth = ctx.measureText(catText).width + 24
    ctx.fillStyle = RED
    ctx.fillRect(W - PAD - catWidth, PAD, catWidth, 28)
    ctx.fillStyle = WHITE
    ctx.textAlign = "center"
    ctx.fillText(catText, W - PAD - catWidth / 2, PAD + 19)
    ctx.textAlign = "left"
  }

  // Question (main headline)
  ctx.fillStyle = WHITE
  ctx.font = `900 48px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  wrapText(ctx, opts.question.toUpperCase(), PAD, PAD + 150, W - PAD * 2, 56, 3)

  // Results section (if options provided)
  if (opts.options && opts.options.length >= 2) {
    drawResultsBars(ctx, opts.options, PAD, PAD + 340, W - PAD * 2, opts.votedOptionText)
  } else if (opts.votedOptionText && opts.votedPct !== undefined) {
    // Simple voted option display
    ctx.font = `700 13px "DM Sans", Arial, sans-serif`
    ctx.fillStyle = MUTED
    ctx.fillText("YOU VOTED", PAD, PAD + 360)

    ctx.fillStyle = RED
    ctx.font = `900 32px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
    ctx.fillText(opts.votedOptionText.toUpperCase(), PAD, PAD + 400)

    // Progress bar
    const barY = PAD + 425
    ctx.fillStyle = BORDER
    ctx.fillRect(PAD, barY, W - PAD * 2, 12)
    ctx.fillStyle = RED
    ctx.fillRect(PAD, barY, Math.round((W - PAD * 2) * (opts.votedPct / 100)), 12)

    ctx.font = `800 14px "DM Sans", Arial, sans-serif`
    ctx.fillStyle = WHITE
    ctx.fillText(`${Math.round(opts.votedPct)}% of voters agree`, PAD, barY + 36)
  }

  // Footer
  const footerY = H - PAD
  ctx.fillStyle = BORDER
  ctx.fillRect(PAD, footerY - 32, W - PAD * 2, 1)

  ctx.font = `700 13px "DM Sans", Arial, sans-serif`
  ctx.fillStyle = MUTED
  ctx.textAlign = "left"
  ctx.fillText(`${opts.totalVotes.toLocaleString()} VOTES · JOIN THE DEBATE`, PAD, footerY - 8)

  ctx.fillStyle = WHITE
  ctx.font = `800 13px "DM Sans", Arial, sans-serif`
  ctx.textAlign = "right"
  ctx.fillText("TRIBUNAL.COM", W - PAD, footerY - 8)
  ctx.textAlign = "left"

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.95)
  })
}

// ──────────────────────────────────────────────────────────────
//  Instagram Story card (1080 × 1920)
// ──────────────────────────────────────────────────────────────
export async function generateStoryCard(opts: ShareCardOptions): Promise<Blob | null> {
  const W = 1080
  const H = 1920
  const PAD = 90

  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  await waitForFonts()

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, H)
  gradient.addColorStop(0, BLACK)
  gradient.addColorStop(0.5, "#0F0F0F")
  gradient.addColorStop(1, BLACK)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, W, H)

  // Top red band
  ctx.fillStyle = RED
  ctx.fillRect(0, 0, W, 8)

  // Brand header (larger)
  drawBrandHeader(ctx, PAD, 210, 2)

  // Divider
  ctx.fillStyle = BORDER
  ctx.fillRect(PAD, 340, W - PAD * 2, 1)

  // Category badge
  if (opts.category) {
    ctx.font = `900 20px "DM Sans", Arial, sans-serif`
    const catText = opts.category.toUpperCase()
    const catWidth = ctx.measureText(catText).width + 40
    ctx.fillStyle = RED
    ctx.fillRect(PAD, 380, catWidth, 44)
    ctx.fillStyle = WHITE
    ctx.textAlign = "center"
    ctx.fillText(catText, PAD + catWidth / 2, 410)
    ctx.textAlign = "left"
  }

  // Question
  ctx.fillStyle = WHITE
  ctx.font = `900 76px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  wrapText(ctx, opts.question.toUpperCase(), PAD, 520, W - PAD * 2, 88, 4)

  // Voted section
  const voteY = 1080
  ctx.font = `800 22px "DM Sans", Arial, sans-serif`
  ctx.fillStyle = MUTED
  ctx.fillText("YOU VOTED", PAD, voteY)

  if (opts.votedOptionText) {
    ctx.fillStyle = RED
    ctx.font = `900 58px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
    ctx.fillText(opts.votedOptionText.toUpperCase(), PAD, voteY + 68)
  }

  // Results bars (compact)
  if (opts.options && opts.options.length >= 2) {
    const barsY = voteY + 140
    opts.options.slice(0, 3).forEach((opt, i) => {
      const rowY = barsY + i * 80
      const isVoted = opt.text === opts.votedOptionText
      const color = isVoted ? RED : WHITE

      ctx.font = `700 26px "DM Sans", Arial, sans-serif`
      ctx.fillStyle = isVoted ? RED : WHITE
      const label = opt.text.length > 30 ? opt.text.slice(0, 27) + "…" : opt.text
      ctx.fillText(label, PAD, rowY)

      ctx.font = `900 32px "Barlow Condensed", Arial, sans-serif`
      ctx.textAlign = "right"
      ctx.fillStyle = color
      ctx.fillText(`${Math.round(opt.percentage)}%`, W - PAD, rowY)
      ctx.textAlign = "left"

      ctx.fillStyle = BORDER
      ctx.fillRect(PAD, rowY + 14, W - PAD * 2, 14)
      ctx.fillStyle = color
      ctx.fillRect(PAD, rowY + 14, Math.round((W - PAD * 2) * (Math.max(opt.percentage, 0) / 100)), 14)
    })
  } else if (opts.votedPct !== undefined) {
    const barY = voteY + 170
    const barW = W - PAD * 2
    ctx.fillStyle = BORDER
    ctx.fillRect(PAD, barY, barW, 16)
    ctx.fillStyle = RED
    ctx.fillRect(PAD, barY, Math.round(barW * (opts.votedPct / 100)), 16)

    ctx.font = `800 24px "DM Sans", Arial, sans-serif`
    ctx.fillStyle = WHITE
    ctx.fillText(`${Math.round(opts.votedPct)}% OF THE REGION AGREES`, PAD, barY + 52)
  }

  // Stats strip
  ctx.fillStyle = MUTED
  ctx.font = `700 22px "DM Sans", Arial, sans-serif`
  ctx.fillText(`${opts.totalVotes.toLocaleString()} VOTES · LIVE NOW`, PAD, 1620)

  // CTA block
  const ctaY = H - 240
  ctx.fillStyle = RED
  ctx.fillRect(PAD, ctaY, W - PAD * 2, 130)

  ctx.fillStyle = WHITE
  ctx.font = `900 44px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`
  ctx.textAlign = "center"
  ctx.fillText("CAST YOUR VOTE", W / 2, ctaY + 58)

  ctx.font = `700 22px "DM Sans", Arial, sans-serif`
  ctx.fillStyle = "rgba(255,255,255,0.85)"
  ctx.fillText("TRIBUNAL.COM", W / 2, ctaY + 96)
  ctx.textAlign = "left"

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 0.95)
  })
}

// ──────────────────────────────────────────────────────────────
//  URL helpers
// ──────────────────────────────────────────────────────────────
export function getPollUrl(pollId: number): string {
  return `${window.location.origin}/debates/${pollId}`
}

export function getWhatsAppUrl(question: string, pollUrl: string): string {
  const msg = `🔴 "${question}"\n\nWhere do you stand? Cast your vote on The Tribunal — MENA's most honest opinion platform.\n\n${pollUrl}`
  return `https://wa.me/?text=${encodeURIComponent(msg)}`
}

export function getLinkedInUrl(pollUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pollUrl)}`
}

export function getXShareText(question: string, votedOption?: string): string {
  if (votedOption) {
    return `I voted "${votedOption}" on "${question}" — where do you stand? 🔴 @TMHustle`
  }
  return `"${question}" — MENA's most honest opinion debate. Where do you stand? 🔴 @TMHustle`
}

// ──────────────────────────────────────────────────────────────
//  Share helpers — use Web Share API with image files when available
// ──────────────────────────────────────────────────────────────
export async function shareWithImage(opts: {
  blob: Blob
  title: string
  text: string
  url: string
  fileName?: string
}): Promise<"shared" | "downloaded" | "failed"> {
  const file = new File([opts.blob], opts.fileName ?? "tribunal-debate.png", { type: "image/png" })

  // Mobile: Web Share API with file
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: opts.title,
        text: opts.text,
        url: opts.url,
        files: [file],
      })
      return "shared"
    } catch (err: any) {
      if (err?.name === "AbortError") return "failed"
      // Fall through to download
    }
  }

  // Desktop fallback: download the image
  try {
    const url = URL.createObjectURL(opts.blob)
    const a = document.createElement("a")
    a.href = url
    a.download = opts.fileName ?? "tribunal-debate.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return "downloaded"
  } catch {
    return "failed"
  }
}
