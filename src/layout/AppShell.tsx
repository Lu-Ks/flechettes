import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav/BottomNav'
import './AppShell.css'

export function AppShell() {
  const location = useLocation()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <div className="app-shell__content" ref={contentRef}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
