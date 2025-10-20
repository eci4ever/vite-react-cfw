import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
})

// Mock data for dashboard
const revenueData = [
  { month: "Jan", revenue: 45000, expenses: 28000 },
  { month: "Feb", revenue: 52000, expenses: 31000 },
  { month: "Mar", revenue: 48000, expenses: 29000 },
  { month: "Apr", revenue: 61000, expenses: 35000 },
  { month: "May", revenue: 55000, expenses: 32000 },
  { month: "Jun", revenue: 67000, expenses: 38000 },
]

const projectsData = [
  { name: "E-Commerce", progress: 65, status: "on-track" },
  { name: "Mobile App", progress: 45, status: "at-risk" },
  { name: "Analytics", progress: 100, status: "completed" },
  { name: "CRM Integration", progress: 15, status: "delayed" },
]

const recentActivities = [
  {
    id: 1,
    user: "Alice Johnson",
    action: "completed task",
    target: "UI Design Review",
    project: "E-Commerce Platform",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: "Bob Smith",
    action: "updated project",
    target: "Sprint Planning",
    project: "Mobile App",
    time: "4 hours ago",
  },
  {
    id: 3,
    user: "Carol White",
    action: "created invoice",
    target: "#INV-2024-089",
    project: "Client Project",
    time: "5 hours ago",
  },
  {
    id: 4,
    user: "David Lee",
    action: "added comment",
    target: "API Integration",
    project: "CRM System",
    time: "1 day ago",
  },
  {
    id: 5,
    user: "Emma Davis",
    action: "uploaded file",
    target: "Design Assets.zip",
    project: "Marketing Site",
    time: "1 day ago",
  },
]

const upcomingTasks = [
  { id: 1, title: "Client Presentation", due: "Today", priority: "high", project: "E-Commerce" },
  { id: 2, title: "Code Review", due: "Tomorrow", priority: "medium", project: "Mobile App" },
  { id: 3, title: "Design Mockups", due: "Nov 2", priority: "high", project: "Analytics" },
  { id: 4, title: "Testing Phase", due: "Nov 5", priority: "low", project: "CRM Integration" },
]

const teamMembers = [
  { name: "Alice Johnson", role: "Lead Designer", tasks: 8, completed: 6 },
  { name: "Bob Smith", role: "Frontend Dev", tasks: 12, completed: 9 },
  { name: "Carol White", role: "Backend Dev", tasks: 10, completed: 7 },
  { name: "David Lee", role: "iOS Developer", tasks: 9, completed: 5 },
]

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
  progress: {
    label: "Progress",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const statusColors: Record<string, string> = {
  "on-track": "bg-green-500",
  "at-risk": "bg-yellow-500",
  "delayed": "bg-red-500",
  "completed": "bg-blue-500",
}

const priorityVariants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  "high": "destructive",
  "medium": "default",
  "low": "secondary",
}

function Dashboard() {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)

  // Calculate statistics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1)

  const activeProjects = projectsData.filter(p => p.status !== "completed").length
  const completedProjects = projectsData.filter(p => p.status === "completed").length
  const avgProgress = Math.round(projectsData.reduce((sum, p) => sum + p.progress, 0) / projectsData.length)

  const totalTasks = teamMembers.reduce((sum, m) => sum + m.tasks, 0)
  const completedTasks = teamMembers.reduce((sum, m) => sum + m.completed, 0)

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your projects today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              +{profitMargin}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} completed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Progress</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedTasks / totalTasks) * 100)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Revenue and expenses for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-revenue)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-expenses)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-expenses)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `$${Number(value).toLocaleString()}`}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="expenses"
                  type="monotone"
                  fill="url(#fillExpenses)"
                  stroke="var(--color-expenses)"
                  strokeWidth={2}
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Current project progress overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectsData.map((project) => (
              <div key={project.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground">{project.progress}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${statusColors[project.status]}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {project.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Upcoming Tasks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.project}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{task.title}</p>
                      <Badge variant={priorityVariants[task.priority]} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{task.project}</span>
                      <span>•</span>
                      <span>Due {task.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Individual task completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Card key={member.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">{member.name}</CardTitle>
                      <CardDescription className="text-xs">{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Tasks</span>
                      <span className="font-medium">{member.completed}/{member.tasks}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(member.completed / member.tasks) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* New Project Dialog */}
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button>+ New Project</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Add a new project to your workspace. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input id="project-name" placeholder="Enter project name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Input id="project-description" placeholder="Enter project description" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-status">Status</Label>
                    <Select defaultValue="planning">
                      <SelectTrigger id="project-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project-priority">Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger id="project-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="project-budget">Budget ($)</Label>
                      <Input id="project-budget" type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="project-progress">Progress (%)</Label>
                      <Input id="project-progress" type="number" placeholder="0" min="0" max="100" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsProjectDialogOpen(false)}>
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Create Invoice Dialog */}
            <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Create Invoice</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a new invoice for your client. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-customer">Customer</Label>
                    <Select>
                      <SelectTrigger id="invoice-customer">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer1">Acme Corporation</SelectItem>
                        <SelectItem value="customer2">Tech Solutions Inc</SelectItem>
                        <SelectItem value="customer3">Global Enterprises</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-project">Project</Label>
                    <Select>
                      <SelectTrigger id="invoice-project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="project1">E-Commerce Platform</SelectItem>
                        <SelectItem value="project2">Mobile App Development</SelectItem>
                        <SelectItem value="project3">Analytics Dashboard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="invoice-amount">Amount ($)</Label>
                      <Input id="invoice-amount" type="number" placeholder="0.00" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="invoice-date">Due Date</Label>
                      <Input id="invoice-date" type="date" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-description">Description</Label>
                    <Input id="invoice-description" placeholder="Invoice description" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice-status">Status</Label>
                    <Select defaultValue="pending">
                      <SelectTrigger id="invoice-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsInvoiceDialogOpen(false)}>
                    Create Invoice
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add Customer Dialog */}
            <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Add Customer</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Add a new customer to your system. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="customer-name">Company Name</Label>
                    <Input id="customer-name" placeholder="Enter company name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer-contact">Contact Person</Label>
                    <Input id="customer-contact" placeholder="Enter contact name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer-email">Email</Label>
                    <Input id="customer-email" type="email" placeholder="email@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer-phone">Phone</Label>
                    <Input id="customer-phone" type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer-address">Address</Label>
                    <Input id="customer-address" placeholder="Enter address" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customer-type">Customer Type</Label>
                    <Select defaultValue="business">
                      <SelectTrigger id="customer-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsCustomerDialogOpen(false)}>
                    Add Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline">Upload File</Button>
            <Button variant="outline">Generate Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
