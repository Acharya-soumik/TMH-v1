/**
 * Pulse-stat template. One striking number + label + delta.
 */

import type { BrandTokens } from "../../design-tokens-cache.js"
import type { SizeKey } from "../sizes.js"

interface SatoriElement {
  type: string
  props: Record<string, unknown>
}

export interface PulseData {
  title: string
  stat: string
  delta?: string
  deltaUp?: boolean
  source?: string
}

export function pulseStat(data: PulseData, tokens: BrandTokens, size: SizeKey): SatoriElement {
  const isStory = size === "ig_story"
  const deltaColor = data.deltaUp === false ? tokens.accent : "#22C55E"
  const deltaArrow = data.deltaUp === false ? "▼" : "▲"

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
        padding: isStory ? "120px 60px" : "60px",
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
            children: "MENA PULSE",
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: isStory ? "44px" : "32px",
              fontWeight: 900,
              color: tokens.fg,
              lineHeight: 1.15,
              textTransform: "uppercase" as const,
              marginBottom: "auto",
              maxWidth: "80%",
            },
            children: data.title,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginTop: "auto",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: isStory ? "180px" : "140px",
                    fontWeight: 900,
                    color: tokens.fg,
                    lineHeight: 1,
                  },
                  children: data.stat,
                },
              },
              ...(data.delta
                ? [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "32px",
                          fontWeight: 700,
                          fontFamily: tokens.bodyFont,
                          color: deltaColor,
                          marginTop: "16px",
                        },
                        children: `${deltaArrow} ${data.delta}`,
                      },
                    } as SatoriElement,
                  ]
                : []),
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
              { type: "div", props: { children: data.source ?? "Live data" } },
              { type: "div", props: { children: "TRIBUNAL.COM" } },
            ],
          },
        },
      ],
    },
  }
}
