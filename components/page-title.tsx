import type React from "react"
interface PageTitleProps {
  children: React.ReactNode
}

export function PageTitle({ children }: PageTitleProps) {
  return <h1 className="text-3xl font-bold tracking-tight mb-6">{children}</h1>
}

