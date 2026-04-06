// ──────────────────────────────────────────────────────────────
//  Platform handler dispatch — single entry-point for executing
//  a share action on any supported platform.
//
//  Replaces the inline handlers that lived inside ShareModal.tsx.
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
import { generateCard, shareWithImage } from "./card-generator"

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

/** Slugify a title for use in download file names. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}

/** Build the canonical file names for a given share context. */
function fileNames(ctx: ShareContext): { og: string; story: string } {
  const slug = slugify(ctx.title)
  return {
    og: `tribunal-${slug}.png`,
    story: `tribunal-story-${slug}.png`,
  }
}

/**
 * Determine whether image card generation is possible for this context.
 *
 * - Debates: totalVotes > 0, or a voted option exists, or options are present.
 * - Predictions: always true (there is always meaningful data to render).
 * - Pulse: only if a stat string exists.
 */
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

/**
 * Trigger a browser file download from a `Blob`.
 * Cleans up the temporary object URL after the download starts.
 */
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

/** Open a URL in a new browser tab. */
function openTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer")
}

/**
 * Resolve the OG card blob: use the pre-generated one from options if
 * available, otherwise generate on the fly (only when the context supports it).
 */
async function resolveOgCard(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<Blob | null> {
  if (options.cardBlob) return options.cardBlob
  if (!canGenerateCard(ctx)) return null
  return generateCard(ctx, "og")
}

/**
 * Resolve the story card blob (Instagram-specific).
 */
async function resolveStoryCard(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<Blob | null> {
  if (options.storyBlob) return options.storyBlob
  if (!canGenerateCard(ctx)) return null
  return generateCard(ctx, "story")
}

// ── Per-platform handlers ───────────────────────────────────

async function handleWhatsApp(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  const text = buildShareText(ctx, "whatsapp")
  const names = fileNames(ctx)

  if (canGenerateCard(ctx)) {
    try {
      const blob = await resolveOgCard(ctx, options)
      if (blob) {
        const result = await shareWithImage({
          blob,
          title: ctx.title,
          text,
          url: ctx.url,
          fileName: names.og,
        })
        if (result === "downloaded") {
          openTab(getWhatsAppShareUrl(text))
          return { platform: "whatsapp", outcome: "downloaded" }
        }
        if (result === "shared") {
          return { platform: "whatsapp", outcome: "shared" }
        }
      }
    } catch {
      // Fall through to plain link share
    }
  }

  openTab(getWhatsAppShareUrl(text))
  return { platform: "whatsapp", outcome: "opened" }
}

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

async function handleX(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  const fullText = buildShareText(ctx, "x")
  await copyToClipboard(fullText)

  const tweetText = getXShareText(ctx)

  if (canGenerateCard(ctx)) {
    try {
      const blob = await resolveOgCard(ctx, options)
      if (blob) {
        const result = await shareWithImage({
          blob,
          title: ctx.title,
          text: fullText,
          url: ctx.url,
          fileName: fileNames(ctx).og,
        })
        if (result === "downloaded") {
          openTab(getXShareUrl(tweetText, ctx.url))
          return { platform: "x", outcome: "downloaded" }
        }
        if (result === "shared") {
          openTab(getXShareUrl(tweetText, ctx.url))
          return { platform: "x", outcome: "shared" }
        }
      }
    } catch {
      // Fall through to text-only share
    }
  }

  openTab(getXShareUrl(tweetText, ctx.url))
  return { platform: "x", outcome: "opened" }
}

async function handleInstagram(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  await copyToClipboard(ctx.url)

  if (canGenerateCard(ctx)) {
    try {
      const blob = await resolveStoryCard(ctx, options)
      if (blob) {
        const result = await shareWithImage({
          blob,
          title: ctx.title,
          text: ctx.url,
          url: ctx.url,
          fileName: fileNames(ctx).story,
        })
        if (result === "downloaded") {
          openTab("https://www.instagram.com/")
          return { platform: "instagram", outcome: "downloaded" }
        }
        if (result === "shared") {
          return { platform: "instagram", outcome: "shared" }
        }
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

async function handleNative(
  ctx: ShareContext,
  options: ExecuteShareOptions,
): Promise<ShareResult> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return {
      platform: "native",
      outcome: "failed",
      error: "Web Share API not supported",
    }
  }

  const text = buildShareText(ctx, "generic")
  const names = fileNames(ctx)

  // Attempt to share with an image file first
  let blob: Blob | null = null
  try {
    blob = await resolveOgCard(ctx, options)
  } catch {
    // Proceed without image
  }

  if (blob) {
    const file = new File([blob], names.og, { type: "image/png" })
    const canShareFiles =
      navigator.canShare?.({
        files: [new File([], "t.png", { type: "image/png" })],
      }) ?? false

    if (canShareFiles) {
      try {
        await navigator.share({
          title: ctx.title,
          text,
          url: ctx.url,
          files: [file],
        })
        return { platform: "native", outcome: "shared" }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return { platform: "native", outcome: "cancelled" }
        }
        // File sharing failed — fall through to share without file
      }
    }
  }

  // Share without file
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
 * This is the single dispatch point used by the ShareModal UI.
 * Each platform handler encapsulates its own card generation,
 * clipboard operations, URL opening, and API calls.
 *
 * @param ctx      - The share context describing the content to share.
 * @param platform - The target platform (e.g. "whatsapp", "x", "copy").
 * @param options  - Optional overrides: pre-generated card blobs, Majlis credentials, etc.
 * @returns A `ShareResult` describing the outcome of the share action.
 *
 * @example
 * ```ts
 * const result = await executeShare(debateCtx, "whatsapp")
 * if (result.outcome === "downloaded") {
 *   toast({ title: "Image saved!", description: "Attach it to your WhatsApp message." })
 * }
 * ```
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

// ── Re-export helper for consumers that need card-eligibility checks ──

export { canGenerateCard }
