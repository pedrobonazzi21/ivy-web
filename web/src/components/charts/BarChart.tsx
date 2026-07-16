'use client'

type BarChartProps = {
  data: { label: string; value: number; color: string }[]
  height?: number
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  const barWidth = Math.max(20, Math.min(60, 600 / data.length - 8))

  return (
    <div className="flex items-end justify-center gap-3" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / max) * (height - 30)
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-semibold text-zinc-700">{item.value}</span>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: Math.max(barHeight, 4),
                width: barWidth,
                backgroundColor: item.color,
              }}
            />
            <span className="text-[10px] text-zinc-500 text-center max-w-[80px] truncate">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
