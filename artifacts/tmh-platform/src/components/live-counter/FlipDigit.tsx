import { useEffect, useRef } from "react"

export function FlipDigit({ char, prevChar }: { char: string; prevChar: string }) {
  const isNumber = char >= "0" && char <= "9"
  const changed = char !== prevChar && isNumber
  const isSeparator = char === "," || char === "." || char === " "

  if (isSeparator) {
    return (
      <span
        style={{
          display: "inline-block",
          lineHeight: 1,
        }}
      >
        {char}
      </span>
    )
  }

  return (
    <span
      style={{
        display: "inline-block",
        position: "relative",
        overflow: "hidden",
        height: "1.15em",
        lineHeight: 1.15,
      }}
      className="tabular-nums"
    >
      <span
        key={char}
        style={{
          display: "inline-block",
          animation: changed ? "digit-flip-in 0.5s cubic-bezier(0.23,1,0.32,1) forwards" : "none",
          color: changed ? "#DC143C" : "inherit",
          transition: "color 1.5s ease",
        }}
      >
        {char}
      </span>
    </span>
  )
}

export function LiveNumber({
  value,
  className,
  style,
  label,
  prefix,
  suffix,
}: {
  value: number
  className?: string
  style?: React.CSSProperties
  label?: string
  prefix?: string
  suffix?: string
}) {
  const formatted = value.toLocaleString("en-US")
  const prevRef = useRef(formatted)
  const prevFormatted = prevRef.current

  useEffect(() => {
    prevRef.current = formatted
  }, [formatted])

  return (
    <span className={className} style={style} aria-label={label || `${value}`}>
      {prefix}
      {formatted.split("").map((d, i) => (
        <FlipDigit key={i} char={d} prevChar={prevFormatted[i] || d} />
      ))}
      {suffix}
    </span>
  )
}
