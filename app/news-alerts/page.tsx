"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { 
  Bell, 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle,
  Check,
  X
} from "lucide-react"

import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Alert {
  id: string
  keyword: string
  type: "keyword" | "source" | "author"
  active: boolean
  createdAt: string
}

export default function NewsAlertsPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newAlert, setNewAlert] = useState({
    keyword: "",
    type: "keyword" as const,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [globalAlertsEnabled, setGlobalAlertsEnabled] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Load alerts from localStorage
  useEffect(() => {
    if (session?.user?.email) {
      const storageKey = `newsplus-alerts-${session.user.email}`
      const storedAlerts = localStorage.getItem(storageKey)
      
      if (storedAlerts) {
        try {
          const parsedAlerts = JSON.parse(storedAlerts)
          setAlerts(parsedAlerts.alerts || [])
          setGlobalAlertsEnabled(parsedAlerts.enabled !== false)
        } catch (error) {
          console.error("Failed to parse alerts:", error)
        }
      }
      
      setIsLoading(false)
    }
  }, [session])

  // Save alerts to localStorage
  const saveAlerts = (newAlerts: Alert[], enabled: boolean = globalAlertsEnabled) => {
    if (session?.user?.email) {
      const storageKey = `newsplus-alerts-${session.user.email}`
      localStorage.setItem(storageKey, JSON.stringify({
        alerts: newAlerts,
        enabled
      }))
    }
  }

  const handleAddAlert = () => {
    if (!newAlert.keyword.trim()) {
      toast({
        title: "Error",
        description: "Please enter a keyword for the alert",
        variant: "destructive",
      })
      return
    }
    
    const alert: Alert = {
      id: Date.now().toString(),
      keyword: newAlert.keyword.trim(),
      type: newAlert.type,
      active: true,
      createdAt: new Date().toISOString(),
    }
    
    const updatedAlerts = [...alerts, alert]
    setAlerts(updatedAlerts)
    saveAlerts(updatedAlerts)
    
    setNewAlert({
      keyword: "",
      type: "keyword",
    })
    
    setIsDialogOpen(false)
    
    toast({
      title: "Alert created",
      description: `You will now receive alerts for "${alert.keyword}"`,
    })
  }

  const handleToggleAlert = (id: string) => {
    const updatedAlerts = alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    )
    
    setAlerts(updatedAlerts)
    saveAlerts(updatedAlerts)
  }

  const handleDeleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(alert => alert.id !== id)
    setAlerts(updatedAlerts)
    saveAlerts(updatedAlerts)
    
    toast({
      title: "Alert deleted",
      description: "The alert has been removed successfully",
    })
  }

  const handleToggleGlobalAlerts = (enabled: boolean) => {
    setGlobalAlertsEnabled(enabled)
    saveAlerts(alerts, enabled)
    
    toast({
      title: enabled ? "Alerts enabled" : "Alerts disabled",
      description: enabled 
        ? "You will now receive news alerts" 
        : "You will no longer receive news alerts",
    })
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle>News Alerts</PageTitle>
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
          <PageTitle>News Alerts</PageTitle>
          <p className="text-muted-foreground">
            Get notified when news matching your interests is published
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="global-alerts"
              checked={globalAlertsEnabled}
              onCheckedChange={handleToggleGlobalAlerts}
            />
            <Label htmlFor="global-alerts">
              {globalAlertsEnabled ? "Alerts enabled" : "Alerts disabled"}
            </Label>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create News Alert</DialogTitle>
                <DialogDescription>
                  Set up an alert to get notified when news matching your criteria is published
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="alert-type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newAlert.type}
                    onValueChange={(value: "keyword" | "source" | "author") => 
                      setNewAlert(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger id="alert-type" className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">Keyword</SelectItem>
                      <SelectItem value="source">Source</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="keyword" className="text-right">
                    {newAlert.type === "keyword" ? "Keyword" : 
                     newAlert.type === "source" ? "Source" : "Author"}
                  </Label>
                  <Input
                    id="keyword"
                    value={newAlert.keyword}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, keyword: e.target.value }))}
                    className="col-span-3"
                    placeholder={
                      newAlert.type === "keyword" ? "Enter keyword (e.g., 'climate change')" : 
                      newAlert.type === "source" ? "Enter source (e.g., 'BBC News')" : 
                      "Enter author name"
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAlert}>
                  <Bell className="mr-2 h-4 w-4" />
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {!globalAlertsEnabled && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <CardContent className="p-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              All news alerts are currently disabled. Toggle the switch above to enable alerts.
            </p>
          </CardContent>
        </Card>
      )}
      
      {alerts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No alerts set up yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first alert to get notified when news matching your interests is published
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map(alert => (
            <Card key={alert.id} className={`transition-all ${!alert.active && 'opacity-60'}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-4 ${
                    alert.active ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <Bell className={`h-5 w-5 ${
                      alert.active ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{alert.keyword}</h3>
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleAlert(alert.id)}
                    title={alert.active ? "Disable alert" : "Enable alert"}
                  >
                    {alert.active ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive/90"
                        title="Delete alert"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Alert</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this alert? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
