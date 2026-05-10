/**
 * Poll-result-split template. Two-side split showing the binary winner with
 * the percentage call-out and the question on top.
 *
 * Adapts to size variant: portrait stories stack the bars vertically;
 * landscape uses a horizontal split.
 */

import type { BrandTokens } from "../../design-tokens-cache.js"
import type { SizeKey } from "../sizes.js"

interface SatoriElement {
  type: string
  props: Record<string, unknown>
}

export interface PollData {
  question: string
  category?: string
  totalVotes: number
  options: { text: string; percentage: number }[]
}

export function pollResultSplit(data: PollData, tokens: BrandTokens, size: SizeKey): SatoriElement {
  const isStory = size === "ig_story"
  const isSquare = size === "ig_square"
  const top = data.options.slice(0, 2) // binary
  const winner = top.reduce((a, b) => (a.percentage >= b.percentage ? a : b), top[0])

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: tokens.bg,
        fontFamily: tokens.headingFont,
        padding: isStory ? "100px 60px" : "60px",
      },
      children: [
        // Brand strip
        {
          type: "div",
          props: {
            style: { display: "flex", height: "5px", backgroundColor: tokens.accent, marginBottom: "32px" },
          },
        },
        // Header
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: isStory ? "20px" : "16px",
              color: tokens.muted,
              fontFamily: tokens.bodyFont,
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              marginBottom: "20px",
            },
            children: data.category ?? "DEBATE",
          },
        },
        // Question
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: isStory ? "56px" : isSquare ? "52px" : "44px",
              fontWeight: 900,
              color: tokens.fg,
              lineHeight: 1.1,
              letterSpacing: "0.5px",
              textTransform: "uppercase" as const,
              marginBottom: "auto",
            },
            children: data.question,
          },
        },
        // Result bars
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: isStory ? "column" : "row",
              width: "100%",
              gap: "16px",
              marginTop: "40px",
            },
            children: top.map((opt) => {
              const isWinner = opt === winner && winner.percentage > 0
              return {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    padding: "24px",
                    border: `2px solid ${isWinner ? tokens.accent : tokens.border}`,
                    backgroundColor: isWinner ? tokens.accent : "transparent",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "16px",
                          fontWeight: 700,
                          fontFamily: tokens.bodyFont,
                          color: isWinner ? tokens.fg : tokens.muted,
                          textTransform: "uppercase" as const,
                          letterSpacing: "1px",
                          marginBottom: "8px",
                        },
                        children: opt.text,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: isStory ? "84px" : "60px",
                          fontWeight: 900,
                          color: isWinner ? tokens.fg : tokens.fg,
                          lineHeight: 1,
                        },
                        children: `${Math.round(opt.percentage)}%`,
                      },
                    },
                  ],
                },
              }
            }),
          },
        },
        // Footer
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: `1px solid ${tokens.border}`,
              color: tokens.muted,
              fontSize: isStory ? "18px" : "14px",
              fontWeight: 700,
              fontFamily: tokens.bodyFont,
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
            },
            children: [
              { type: "div", props: { children: `${data.totalVotes.toLocaleString()} votes` } },
              { type: "div", props: { children: "TRIBUNAL.COM" } },
            ],
          },
        },
      ],
    },
  }
}
