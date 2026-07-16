'use client'

type DoughnutChartProps = {
  data: { label: string; value: number; color: string }[]
  size?: number
}

export function DoughnutChart({ data, size = 160 }: DoughnutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 16
  const strokeWidth = 24
  const normalizedR = r - strokeWidth / 2

  let cumulative = 0
  const segments = data.map(d => {
    const startAngle = (cumulative / total) * 360
    cumulative += d.value
    const endAngle = (cumulative / total) * 360
    return { ...d, startAngle, endAngle }
  })

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(startAngle: number, endAngle: number) {
    if (endAngle - startAngle >= 360) {
      const mid = polarToCartesian(cx, cy, normalizedR, 180)
      const end = polarToCartesian(cx, cy, normalizedR, 359.9)
      const start = polarToCartesian(cx, cy, normalizedR, 0)
      return `M ${start.x} ${start.y} A ${normalizedR} ${normalizedR} 0 1 1 ${mid.x} ${mid.y} A ${normalizedR} ${normalizedR} 0 1 1 ${end.x} ${end.y}`
    }
    const start = polarToCartesian(cx, cy, normalizedR, startAngle)
    const end = polarToCartesian(cx, cy, normalizedR, endAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${normalizedR} ${normalizedR} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={normalizedR} fill="none" stroke="#f4f4f5" strokeWidth={strokeWidth} />
        {segments.map((s, i) => (
          <path
            key={i}
            d={describeArc(s.startAngle, s.endAngle)}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        ))}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          className="fill-zinc-900 text-lg font-bold" transform="rotate(90, cx, cy)">
          {total}
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
