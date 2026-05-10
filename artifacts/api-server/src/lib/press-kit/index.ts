/**
 * Press-kit module — entry point for renderers, captions, and the size catalog.
 */

export { SIZES, ALL_SIZE_KEYS, isValidSize, type SizeKey } from "./sizes.js"
export { renderToPng, uploadAsset, type UploadResult } from "./render.js"
export { generateCaptions, type CaptionSet, type CaptionInput } from "./captions.js"

export { pollResultSplit, type PollData } from "./templates/poll-result-split.js"
export { voiceQuote, type VoiceData } from "./templates/voice-quote.js"
export { predictionMomentum, type PredictionData } from "./templates/prediction-momentum.js"
export { pulseStat, type PulseData } from "./templates/pulse-stat.js"

export const TEMPLATES = {
  "poll-result-split": "poll",
  "voice-quote": "voice",
  "prediction-momentum": "prediction",
  "pulse-stat": "pulse",
} as const

export type TemplateKey = keyof typeof TEMPLATES
