/**
 * Prediction-momentum template. Big call-out percentage with the question
 * and a "X days to resolve" tag.
 */

import type { BrandTokens } from "../../design-tokens-cache.js"
import type { SizeKey } from "../sizes.js"

interface SatoriElement {
  type: string
  props: Record<string, unknown>
}

export interface PredictionData {
  question: string
  yesPercentage: number
  totalVotes: number
  daysToResolve?: number | null
}

export function predictionMomentum(data: PredictionData, tokens: BrandTokens, size: SizeKey): SatoriElement {
  const isStory = size === "ig_story"
  const yes = Math.round(data.yesPercentage)
  const no = 100 - yes
  const consensus = yes >= 50 ? "YES" : "NO"
  const consensusPct = yes >= 50 ? yes : no

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
        {
          type: "div",
          props: {
            style: { display: "flex", height: "5px", backgroundColor: tokens.accent, marginBottom: "32px" },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "16px",
              color: tokens.muted,
              fontFamily: tokens.bodyFont,
              fontWeight: 700,
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              marginBottom: "20px",
            },
            children: "PREDICTION",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: isStory ? "48px" : "38px",
              fontWeight: 900,
              color: tokens.fg,
              lineHeight: 1.1,
              textTransform: "uppercase" as const,
              marginBottom: "auto",
            },
            children: data.question,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "baseline",
              marginTop: "60px",
              gap: "20px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: isStory ? "180px" : "140px",
                    fontWeight: 900,
                    color: tokens.accent,
                    lineHeight: 1,
                  },
                  children: `${consensusPct}%`,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "28px",
                          fontWeight: 900,
                          color: tokens.fg,
                          letterSpacing: "2px",
                        },
                        children: `say ${consensus}`,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "16px",
                          fontWeight: 600,
                          fontFamily: tokens.bodyFont,
                          color: tokens.muted,
                          letterSpacing: "1.5px",
                          marginTop: "6px",
                          textTransform: "uppercase" as const,
                        },
                        children: data.daysToResolve != null
                          ? `Resolves in ${data.daysToResolve} days`
                          : "Live prediction",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
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
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: tokens.bodyFont,
              letterSpacing: "2px",
              textTransform: "uppercase" as const,
            },
            children: [
              { type: "div", props: { children: `${data.totalVotes.toLocaleString()} forecasts` } },
              { type: "div", props: { children: "TRIBUNAL.COM" } },
            ],
          },
        },
      ],
    },
  }
}
