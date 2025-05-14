"use client"

import * as React from "react"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Ensure component is mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full w-9 h-9">
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full w-9 h-9 relative overflow-hidden transition-colors",
            theme === "dark" && "bg-slate-800 text-slate-50 hover:text-white hover:bg-slate-700",
            theme === "light" && "bg-slate-100 text-slate-900 hover:bg-slate-200"
          )}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px] animate-in slide-in-from-top-2 fade-in-20">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "cursor-pointer flex items-center gap-2 transition-colors",
            theme === "light" && "bg-accent font-medium"
          )}
        >
          <div className="rounded-full bg-orange-100 dark:bg-orange-400/20 p-1">
            <Sun className="h-4 w-4 text-orange-600 dark:text-orange-300" />
          </div>
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "cursor-pointer flex items-center gap-2 transition-colors",
            theme === "dark" && "bg-accent font-medium"
          )}
        >
          <div className="rounded-full bg-indigo-100 dark:bg-indigo-400/20 p-1">
            <Moon className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          </div>
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "cursor-pointer flex items-center gap-2 transition-colors",
            theme === "system" && "bg-accent font-medium"
          )}
        >
          <div className="rounded-full bg-gray-100 dark:bg-gray-400/20 p-1">
            <Laptop className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
