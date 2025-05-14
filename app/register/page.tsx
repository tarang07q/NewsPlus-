"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, Mail, Lock, User, Newspaper } from "lucide-react"
import { PageTitle } from "@/components/page-title"
import { useToast } from "@/components/ui/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Username is required")
      return false
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }

    if (!formData.password) {
      setError("Password is required")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      toast({
        title: "Account created!",
        description: "Your account has been created successfully. You can now log in.",
      })

      router.push("/login?registered=true")
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4 relative">
      <PageTitle>Register for NewsPlus+</PageTitle>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-2 relative z-10 overflow-hidden">
        {/* Card background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background to-background/80 z-0"></div>

        {/* Card content */}
        <div className="relative z-10">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4 w-20 h-20 flex items-center justify-center shadow-lg border border-primary/20">
                <UserPlus className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Join NewsPlus+
            </CardTitle>
            <CardDescription className="text-center text-base">
              Create your account to access personalized news
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            {error && (
              <Alert variant="destructive" className="mb-6 shadow-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary/70" />
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-4 h-12 border-2 focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary/70" />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-4 h-12 border-2 focus:border-primary/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-primary/70" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-4 h-12 border-2 focus:border-primary/50"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-primary/70" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t px-6 py-6 bg-muted/30">
            <p className="text-sm text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

