"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  Newspaper,
  Bookmark,
  LogOut,
  Menu,
  X,
  User,
  BarChart,
  History,
  Bell,
  Settings,
  LayoutDashboard,
  Sparkles
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { cn } from "@/lib/utils"

const categories = [
  { name: "General", slug: "general" },
  { name: "Business", slug: "business" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Health", slug: "health" },
  { name: "Science", slug: "science" },
  { name: "Sports", slug: "sports" },
  { name: "Technology", slug: "technology" },
]

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            <span className="text-xl font-bold">NewsPlus+</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/" ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Newspaper className="h-4 w-4 mr-1 inline-block" />
            News
          </Link>

          {session && (
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
              )}
            >
              <LayoutDashboard className="h-4 w-4 mr-1 inline-block" />
              Dashboard
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-sm font-medium">
                <Sparkles className="h-4 w-4 mr-1" />
                Categories
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {categories.map((category) => (
                <DropdownMenuItem key={category.slug} asChild>
                  <Link href={`/?category=${category.slug}`}>{category.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {session && (
            <>
              <Link
                href="/bookmarks"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/bookmarks" ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Bookmark className="h-4 w-4 mr-1 inline-block" />
                Bookmarks
              </Link>

              <Link
                href="/news-alerts"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/news-alerts" ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Bell className="h-4 w-4 mr-1 inline-block" />
                Alerts
              </Link>
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="font-medium">
                  <User className="mr-2 h-4 w-4" />
                  <span>{session.user?.name || session.user?.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/bookmarks">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span>Bookmarks</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/reading-history">
                    <History className="mr-2 h-4 w-4" />
                    <span>Reading History</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/news-stats">
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>News Stats</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/news-alerts">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>News Alerts</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/news-preferences">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link href="/" className="block py-2 text-sm font-medium" onClick={toggleMobileMenu}>
              Home
            </Link>
            <div className="py-2">
              <p className="text-sm font-medium mb-2">Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/?category=${category.slug}`}
                    className="text-sm text-muted-foreground py-1"
                    onClick={toggleMobileMenu}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center py-2 text-sm font-medium"
                  onClick={toggleMobileMenu}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/bookmarks"
                  className="flex items-center py-2 text-sm font-medium"
                  onClick={toggleMobileMenu}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Bookmarks
                </Link>
                <Link
                  href="/reading-history"
                  className="flex items-center py-2 text-sm font-medium"
                  onClick={toggleMobileMenu}
                >
                  <History className="mr-2 h-4 w-4" />
                  Reading History
                </Link>
                <Link
                  href="/news-stats"
                  className="flex items-center py-2 text-sm font-medium"
                  onClick={toggleMobileMenu}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  News Stats
                </Link>
                <Link
                  href="/news-alerts"
                  className="flex items-center py-2 text-sm font-medium"
                  onClick={toggleMobileMenu}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  News Alerts
                </Link>
                <Link
                  href="/news-preferences"
                  className="flex items-center py-2 text-sm font-medium"
                  onClick={toggleMobileMenu}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </Link>
                <div className="flex items-center py-2 text-sm font-medium">
                  <span className="mr-2">Theme:</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  className="flex items-center w-full justify-start px-0 text-destructive"
                  onClick={() => {
                    signOut({ callbackUrl: "/login" })
                    toggleMobileMenu()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={toggleMobileMenu}>
                    Login
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register" onClick={toggleMobileMenu}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

