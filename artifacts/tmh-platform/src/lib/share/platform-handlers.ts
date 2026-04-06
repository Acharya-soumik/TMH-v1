// ──────────────────────────────────────────────────────────────
//  Platform handler dispatch — single entry-point for executing
//  a share action on any supported platform.
//
//  Each handler controls its own mobile vs desktop strategy.
//  navigator.share is ONLY used for:
//    1. WhatsApp mobile (files + text with URL embedded)
//    2. Native share (text + URL only, no files)
//  All other platforms use intent URLs + card download.
// ──────────────────────────────────────────────────────────────

import type {
  ShareContext,
  SharePlatform,
  ShareResult,
} from "./types"
import { copyToClipboard } from "./clipboard"
import {
  getWhatsAppShareUrl,
  getLinkedInShareUrl,
  getXShareUrl,
} from "./url-builders"
import { buildShareText, getXShareText } from "./templates"
import { generateCard } from "./card-generator"

// ── Options ─────────────────────────────────────────────────

export interface ExecuteShareOptions {
  /** Pre-generated OG card blob (skip generation if provided). */
  cardBlob?: Blob | null
  /** Pre-generated story card blob (used by Instagram). */
  storyBlob?: Blob | null
  /** Majlis channel ID to post to. */
  majlisChannelId?: number
  /** Auth token for the Majlis API. */
  majlisToken?: string
  /** Pre-formatted message body for Majlis. */
  majlisMessage?: string
}

// ── Helpers ─────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}

function fileNames(ctx: ShareContext): { og: string; story: string } {
  const slug = slugify(ctx.title)
  return {
    og: `tribunal-${slug}.png`,
    story: `tribunal-story-${slug}.png`,
  }
}

function canGenerateCard(ctx: ShareContext): boolean {
  switch (ctx.contentType) {
    case "debate":
      return ctx.totalVotes > 0 || !!ctx.votedOptionText || ctx.options.length > 0
    case "prediction":
      return true
    case "pulse":
      return !!ctx.stat
  }
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function openTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer")
}

function isMobile(): boolean {
  return typeof navigator !== "undefined" && navigator.maxTouchPoints > 0
}

async function resolveOgCard(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<Blob | null> {
  if (options.cardBlob) return options.cardBlob
  if (!canGenerateCard(ctx)) return null
  return generateCard(ctx, "og")
}

async function resolveStoryCard(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<Blob | null> {
  if (options.storyBlob) return options.storyBlob
  if (!canGenerateCard(ctx)) return null
  return generateCard(ctx, "story")
}

// ── Per-platform handlers ───────────────────────────────────

/**
 * WhatsApp sharing strategy:
 *
 * MOBILE: Use navigator.share with files + text (URL embedded in text).
 *   - files: [card image]
 *   - text: "message body\n\nhttps://tribunal.com/debates/42"
 *   - NO separate `url` param (platforms drop text when both url and files present)
 *   WhatsApp on iOS/Android handles file+text well — shows image AND message.
 *
 * DESKTOP: Download the card image + open wa.me intent with text.
 *   wa.me only supports text — user attaches the downloaded image manually.
 */
async function handleWhatsApp(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  // WhatsApp text already includes the URL (from templates.ts)
  const text = buildShareText(ctx, "whatsapp")
  const names = fileNames(ctx)

  if (isMobile() && canGenerateCard(ctx)) {
    // Mobile: try sharing image + text together via navigator.share
    try {
      const blob = await resolveOgCard(ctx, options)
      if (blob) {
        const file = new File([blob], names.og, { type: "image/png" })
        const canShareFiles =
          navigator.canShare?.({ files: [file] }) ?? false

        if (canShareFiles) {
          try {
            // Key: embed URL in `text`, do NOT pass separate `url` param.
            // This prevents platforms from dropping the text body.
            await navigator.share({ text, files: [file] })
            return { platform: "whatsapp", outcome: "shared" }
          } catch (err: unknown) {
            if (err instanceof DOMException && err.name === "AbortError") {
              return { platform: "whatsapp", outcome: "cancelled" }
            }
            // Failed — fall through to wa.me
          }
        }
      }
    } catch {
      // Card generation failed — fall through to wa.me
    }
  }

  // Desktop (or mobile fallback): download card + open wa.me
  if (canGenerateCard(ctx)) {
    try {
      const blob = await resolveOgCard(ctx, options)
      if (blob) {
        downloadBlob(blob, names.og)
        openTab(getWhatsAppShareUrl(text))
        return { platform: "whatsapp", outcome: "downloaded" }
      }
    } catch {
      // Card generation failed — open wa.me without image
    }
  }

  openTab(getWhatsAppShareUrl(text))
  return { platform: "whatsapp", outcome: "opened" }
}

/**
 * LinkedIn sharing strategy:
 *
 * LinkedIn's share URL only accepts a URL param — it fetches OG tags to
 * build the preview. We also copy the share text to clipboard and
 * download the card image for the user to paste/attach manually.
 */
async function handleLinkedIn(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  const text = buildShareText(ctx, "linkedin")
  await copyToClipboard(text)

  if (canGenerateCard(ctx)) {
    try {
      const blob = await resolveOgCard(ctx, options)
      if (blob) {
        downloadBlob(blob, fileNames(ctx).og)
        openTab(getLinkedInShareUrl(ctx.url))
        return { platform: "linkedin", outcome: "downloaded" }
      }
    } catch {
      // Fall through to text-only share
    }
  }

  openTab(getLinkedInShareUrl(ctx.url))
  return { platform: "linkedin", outcome: "opened" }
}

/**
 * X/Twitter sharing strategy:
 *
 * Always open the tweet intent URL with text + url params.
 * Download the card image for manual attachment.
 * Never use navigator.share — it hijacks the flow on desktop Chrome.
 */
async function handleX(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  const tweetText = getXShareText(ctx)

  if (canGenerateCard(ctx)) {
    try {
      const blob = await resolveOgCard(ctx, options)
      if (blob) {
        downloadBlob(blob, fileNames(ctx).og)
        openTab(getXShareUrl(tweetText, ctx.url))
        return { platform: "x", outcome: "downloaded" }
      }
    } catch {
      // Fall through to text-only share
    }
  }

  openTab(getXShareUrl(tweetText, ctx.url))
  return { platform: "x", outcome: "opened" }
}

/**
 * Instagram sharing strategy:
 *
 * Instagram has no URL-based sharing API. We:
 * 1. Download the story-format card (1080×1920)
 * 2. Copy the URL to clipboard
 * 3. Open Instagram
 * User manually uploads the story image and pastes the link.
 */
async function handleInstagram(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  await copyToClipboard(ctx.url)

  if (canGenerateCard(ctx)) {
    try {
      const blob = await resolveStoryCard(ctx, options)
      if (blob) {
        downloadBlob(blob, fileNames(ctx).story)
        openTab("https://www.instagram.com/")
        return { platform: "instagram", outcome: "downloaded" }
      }
    } catch {
      // Fall through to link-only share
    }
  }

  openTab("https://www.instagram.com/")
  return { platform: "instagram", outcome: "opened" }
}

async function handleCopy(ctx: ShareContext): Promise<ShareResult> {
  const text = buildShareText(ctx, "generic")
  const ok = await copyToClipboard(text)
  return {
    platform: "copy",
    outcome: ok ? "copied" : "failed",
    error: ok ? undefined : "Clipboard write failed",
  }
}

async function handleDownload(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  try {
    const blob = await resolveOgCard(ctx, options)
    if (blob) {
      downloadBlob(blob, fileNames(ctx).og)
      return { platform: "download", outcome: "downloaded" }
    }
    return {
      platform: "download",
      outcome: "failed",
      error: "Card generation returned null",
    }
  } catch (err) {
    return {
      platform: "download",
      outcome: "failed",
      error: err instanceof Error ? err.message : "Card generation failed",
    }
  }
}

/**
 * Native share (mobile "Share" button):
 *
 * Shares text + URL only — NO files. When files are included in
 * navigator.share, most mobile browsers/apps drop the text and url
 * fields. Users can grab the card image via the "Save Card" button.
 */
async function handleNative(
  ctx: ShareContext,
  _options: ExecuteShareOptions,
): Promise<ShareResult> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return {
      platform: "native",
      outcome: "failed",
      error: "Web Share API not supported",
    }
  }

  const text = buildShareText(ctx, "generic")

  try {
    await navigator.share({
      title: ctx.title,
      text,
      url: ctx.url,
    })
    return { platform: "native", outcome: "shared" }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { platform: "native", outcome: "cancelled" }
    }
    return {
      platform: "native",
      outcome: "failed",
      error: err instanceof Error ? err.message : "Native share failed",
    }
  }
}

async function handleMajlis(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  const { majlisChannelId, majlisToken, majlisMessage } = options

  if (!majlisChannelId || !majlisToken) {
    return {
      platform: "majlis",
      outcome: "failed",
      error: "Missing Majlis channel ID or auth token",
    }
  }

  const content = majlisMessage ?? buildShareText(ctx, "generic")
  const baseUrl = import.meta.env?.VITE_API_BASE_URL ?? ""

  try {
    const res = await fetch(
      `${baseUrl}/api/majlis/channels/${majlisChannelId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-majlis-token": majlisToken,
        },
        body: JSON.stringify({ content }),
      },
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return {
        platform: "majlis",
        outcome: "failed",
        error: (body as { error?: string }).error ?? `HTTP ${res.status}`,
      }
    }

    return { platform: "majlis", outcome: "sent" }
  } catch (err) {
    return {
      platform: "majlis",
      outcome: "failed",
      error: err instanceof Error ? err.message : "Network request failed",
    }
  }
}

// ── Main dispatcher ─────────────────────────────────────────

/**
 * Execute a share action for the given platform.
 *
 * Each platform handler encapsulates its own card generation,
 * clipboard operations, URL opening, and API calls with
 * mobile vs desktop awareness.
 */
export async function executeShare(
  ctx: ShareContext,
  platform: SharePlatform,
  options: ExecuteShareOptions = {},
): Promise<ShareResult> {
  switch (platform) {
    case "whatsapp":
      return handleWhatsApp(ctx, options)
    case "linkedin":
      return handleLinkedIn(ctx, options)
    case "x":
      return handleX(ctx, options)
    case "instagram":
      return handleInstagram(ctx, options)
    case "copy":
      return handleCopy(ctx)
    case "download":
      return handleDownload(ctx, options)
    case "native":
      return handleNative(ctx, options)
    case "majlis":
      return handleMajlis(ctx, options)
    default: {
      const _exhaustive: never = platform
      return {
        platform: _exhaustive,
        outcome: "failed",
        error: `Unknown platform: ${platform}`,
      }
    }
  }
}

export { canGenerateCard }
