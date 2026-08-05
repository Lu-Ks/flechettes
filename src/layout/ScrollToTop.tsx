import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Resets window-level scroll on every route change (SPA routing doesn't do this by default). */
export function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return null
}
