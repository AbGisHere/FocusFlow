"use client"

import { useEffect, useState } from "react"

export function FrostedHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const base =
    "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 border-b"

  const stationary =
    "bg-background/35 supports-[backdrop-filter]:bg-background/25 backdrop-blur-xl backdrop-saturate-150 border-border/40"

  const scrolledStyles =
    "bg-background/75 supports-[backdrop-filter]:bg-background/60 backdrop-blur-2xl backdrop-saturate-150 border-border/60 shadow-sm"

  return (
    <header
      className={`${base} ${scrolled ? scrolledStyles : stationary} ${className ?? ""}`}
    >
      {children}
    </header>
  )
}
