"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, CheckCircle2, User } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Check if user just registered
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowSuccess(true)
      toast({
        title: "Registration successful!",
        description: "Your account has been created. Please log in.",
        variant: "default",
      })
    }
  }, [searchParams, toast])

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }

    if (!password) {
      setError("Password is required")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
        setIsLoading(false)
        return
      }

      toast({
        title: "Login successful!",
        description: "Welcome back to NewsPlus+",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      setError("Something went wrong. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4 relative">
      <PageTitle>Login to NewsPlus+</PageTitle>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-2 relative z-10 overflow-hidden">
        {/* Card background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background to-background/80 z-0"></div>

        {/* Card content */}
        <div className="relative z-10">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4 w-20 h-20 flex items-center justify-center shadow-lg border border-primary/20">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-center text-base">
              Enter your credentials to access your NewsPlus+ account
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            {showSuccess && (
              <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800 shadow-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <AlertDescription>Registration successful! You can now log in.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6 shadow-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary/70" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-4 h-12 border-2 focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-primary/70" />
                    Password
                  </Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-4 h-12 border-2 focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-6 transition-all font-medium text-base shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t px-6 py-6 bg-muted/30">
            <p className="text-sm text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Create an account
              </Link>
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                </svg>
              </Button>
              <Button variant="outline" size="icon" className="rounded-full w-8 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                </svg>
              </Button>
            </div>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

