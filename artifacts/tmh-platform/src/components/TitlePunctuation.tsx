export interface TitlePunctuationConfig {
  character?: string
  color?: string
  fontStyle?: "normal" | "italic"
  fontWeight?: "normal" | "bold"
}

export const DEFAULT_PUNCTUATION: TitlePunctuationConfig = {
  character: ".",
  color: "#DC143C",
  fontStyle: "normal",
  fontWeight: "bold",
}

interface TitlePunctuationProps {
  config?: TitlePunctuationConfig | null
  /** Inline style overrides applied to the span */
  style?: React.CSSProperties
}

/**
 * Renders a styled end-of-title punctuation mark (e.g., a red period).
 * Falls back to the default red period if no config is provided.
 */
export function TitlePunctuation({ config, style }: TitlePunctuationProps) {
  const cfg = { ...DEFAULT_PUNCTUATION, ...(config ?? {}) }
  if (!cfg.character) return null
  return (
    <span
      style={{
        color: cfg.color,
        fontStyle: cfg.fontStyle,
        fontWeight: cfg.fontWeight === "bold" ? 900 : 400,
        display: "inline",
        ...style,
      }}
    >
      {cfg.character}
    </span>
  )
}
