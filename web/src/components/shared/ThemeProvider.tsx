'use client'

import { useEffect } from 'react'

function applyTheme(mode: string | null, theme: string | null) {
  const m = mode ?? 'light'
  const t = theme ?? 'indigo'
  document.documentElement.setAttribute('data-mode', m)
  document.documentElement.setAttribute('data-theme', t)
  sessionStorage.setItem('ivy_mode', m)
  sessionStorage.setItem('ivy_theme', t)
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cachedMode = sessionStorage.getItem('ivy_mode')
    const cachedTheme = sessionStorage.getItem('ivy_theme')
    if (cachedMode && cachedTheme) {
      applyTheme(cachedMode, cachedTheme)
      return
    }
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => applyTheme(data.settings?.mode, data.settings?.theme))
      .catch(() => applyTheme('light', 'indigo'))
  }, [])

  return <>{children}</>
}
