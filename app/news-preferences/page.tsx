"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { 
  Settings, 
  Save, 
  Newspaper, 
  Globe, 
  Bell, 
  Clock, 
  Languages, 
  Check,
  Sparkles
} from "lucide-react"

import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/components/ui/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// News categories
const categories = [
  { id: "general", name: "General", icon: <Newspaper className="h-4 w-4" /> },
  { id: "business", name: "Business", icon: <Globe className="h-4 w-4" /> },
  { id: "entertainment", name: "Entertainment", icon: <Sparkles className="h-4 w-4" /> },
  { id: "health", name: "Health", icon: <Sparkles className="h-4 w-4" /> },
  { id: "science", name: "Science", icon: <Sparkles className="h-4 w-4" /> },
  { id: "sports", name: "Sports", icon: <Sparkles className="h-4 w-4" /> },
  { id: "technology", name: "Technology", icon: <Sparkles className="h-4 w-4" /> },
]

// News sources
const sources = [
  { id: "bbc-news", name: "BBC News" },
  { id: "cnn", name: "CNN" },
  { id: "the-verge", name: "The Verge" },
  { id: "wired", name: "Wired" },
  { id: "time", name: "TIME" },
  { id: "reuters", name: "Reuters" },
  { id: "associated-press", name: "Associated Press" },
  { id: "techcrunch", name: "TechCrunch" },
]

// Languages
const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ru", name: "Russian" },
]

// Regions
const regions = [
  { code: "us", name: "United States" },
  { code: "gb", name: "United Kingdom" },
  { code: "ca", name: "Canada" },
  { code: "au", name: "Australia" },
  { code: "in", name: "India" },
  { code: "jp", name: "Japan" },
]

interface Preferences {
  categories: string[]
  sources: string[]
  language: string
  region: string
  refreshInterval: number
  notifications: {
    breaking: boolean
    daily: boolean
    weekly: boolean
  }
  darkMode: boolean
  autoRefresh: boolean
}

export default function NewsPreferencesPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>({
    categories: ["general", "technology", "science"],
    sources: ["bbc-news", "the-verge", "reuters"],
    language: "en",
    region: "us",
    refreshInterval: 30,
    notifications: {
      breaking: true,
      daily: true,
      weekly: false,
    },
    darkMode: false,
    autoRefresh: true,
  })

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Load preferences from localStorage
  useEffect(() => {
    if (session?.user?.email) {
      const storageKey = `newsplus-preferences-${session.user.email}`
      const storedPreferences = localStorage.getItem(storageKey)
      
      if (storedPreferences) {
        try {
          const parsedPreferences = JSON.parse(storedPreferences)
          setPreferences(parsedPreferences)
        } catch (error) {
          console.error("Failed to parse preferences:", error)
        }
      }
    }
  }, [session])

  const handleCategoryToggle = (categoryId: string) => {
    setPreferences(prev => {
      const newCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
      
      return {
        ...prev,
        categories: newCategories
      }
    })
  }

  const handleSourceToggle = (sourceId: string) => {
    setPreferences(prev => {
      const newSources = prev.sources.includes(sourceId)
        ? prev.sources.filter(id => id !== sourceId)
        : [...prev.sources, sourceId]
      
      return {
        ...prev,
        sources: newSources
      }
    })
  }

  const handleNotificationToggle = (key: keyof typeof preferences.notifications) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }))
  }

  const handleSavePreferences = () => {
    setIsLoading(true)
    
    // Save to localStorage
    if (session?.user?.email) {
      const storageKey = `newsplus-preferences-${session.user.email}`
      localStorage.setItem(storageKey, JSON.stringify(preferences))
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false)
        toast({
          title: "Preferences saved",
          description: "Your news preferences have been updated successfully.",
        })
      }, 800)
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle>News Preferences</PageTitle>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <PageTitle>News Preferences</PageTitle>
          <p className="text-muted-foreground">
            Customize your news experience by setting your preferences
          </p>
        </div>
        <Button 
          onClick={handleSavePreferences} 
          disabled={isLoading}
          className="transition-all duration-300 hover:shadow-md"
        >
          {isLoading ? (
            <>
              <Settings className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Select the news categories you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div 
                    key={category.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      preferences.categories.includes(category.id) 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 bg-primary/10 p-2 rounded-full">
                        {category.icon}
                      </div>
                      <span>{category.name}</span>
                    </div>
                    {preferences.categories.includes(category.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sources</CardTitle>
                <CardDescription>
                  Select your preferred news sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sources.map(source => (
                    <div 
                      key={source.id}
                      className="flex items-center space-x-2"
                    >
                      <Switch 
                        id={`source-${source.id}`}
                        checked={preferences.sources.includes(source.id)}
                        onCheckedChange={() => handleSourceToggle(source.id)}
                      />
                      <Label htmlFor={`source-${source.id}`}>{source.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Region & Language</CardTitle>
                <CardDescription>
                  Set your preferred region and language for news
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger id="language" className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select
                    value={preferences.region}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger id="region" className="w-full">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region.code} value={region.code}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how and when you want to receive news notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="breaking">Breaking News</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for important breaking news
                    </p>
                  </div>
                  <Switch 
                    id="breaking"
                    checked={preferences.notifications.breaking}
                    onCheckedChange={() => handleNotificationToggle('breaking')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily">Daily Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of top news
                    </p>
                  </div>
                  <Switch 
                    id="daily"
                    checked={preferences.notifications.daily}
                    onCheckedChange={() => handleNotificationToggle('daily')}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly">Weekly Roundup</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of important news
                    </p>
                  </div>
                  <Switch 
                    id="weekly"
                    checked={preferences.notifications.weekly}
                    onCheckedChange={() => handleNotificationToggle('weekly')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize how news is displayed and refreshed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-refresh">Auto-refresh Content</Label>
                    <Switch 
                      id="auto-refresh"
                      checked={preferences.autoRefresh}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoRefresh: checked }))}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh news content when you visit the site
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Refresh Interval (minutes)</Label>
                    <span className="text-sm font-medium">{preferences.refreshInterval}</span>
                  </div>
                  <Slider
                    disabled={!preferences.autoRefresh}
                    value={[preferences.refreshInterval]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, refreshInterval: value[0] }))}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 min</span>
                    <span>30 min</span>
                    <span>60 min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
