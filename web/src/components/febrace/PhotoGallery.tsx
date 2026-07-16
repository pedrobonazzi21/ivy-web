'use client'

import { useState } from 'react'
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react'

type PhotoGalleryProps = {
  photos: { name: string; url: string }[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<number | null>(null)

  if (photos.length === 0) return null

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        <Image size={16} />
        Fotos ({photos.length})
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 transition-all hover:border-indigo-400 hover:shadow-md"
          >
            <div className="flex h-full w-full items-center justify-center text-zinc-300">
              <Image size={28} />
            </div>
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="truncate text-[10px] text-white">{photo.name}</span>
            </div>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setSelected(null)}>
          <div className="relative mx-4 max-w-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-1.5 shadow-lg">
              <X size={16} />
            </button>
            <div className="flex aspect-video items-center justify-center rounded-xl bg-zinc-800">
              <Image size={64} className="text-zinc-600" />
            </div>
            <p className="mt-2 text-center text-sm text-white/80">{photos[selected].name}</p>
            <div className="mt-3 flex justify-center gap-4">
              <button onClick={() => setSelected(Math.max(0, selected - 1))}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 disabled:opacity-30"
                disabled={selected === 0}>
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setSelected(Math.min(photos.length - 1, selected + 1))}
                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 disabled:opacity-30"
                disabled={selected === photos.length - 1}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
