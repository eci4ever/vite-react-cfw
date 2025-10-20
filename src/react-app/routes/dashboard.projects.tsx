import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts"
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export const Route = createFileRoute('/dashboard/projects')({
  component: RouteComponent,
})

// Mock project data
const projectsData = [
  {
    id: 1,
    name: "E-Commerce Platform Redesign",
    description: "Complete overhaul of the online shopping experience with modern UI/UX",
    status: "in-progress",
    priority: "high",
    progress: 65,
    budget: 125000,
    spent: 81250,
    startDate: "2024-01-15",
    endDate: "2024-12-30",
    team: [
      { name: "Alice Johnson", role: "Lead Designer", avatar: "" },
      { name: "Bob Smith", role: "Frontend Dev", avatar: "" },
      { name: "Carol White", role: "Backend Dev", avatar: "" },
    ],
    tasks: { total: 48, completed: 31 },
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Native iOS and Android app for customer engagement",
    status: "in-progress",
    priority: "high",
    progress: 45,
    budget: 180000,
    spent: 81000,
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    team: [
      { name: "David Lee", role: "iOS Developer", avatar: "" },
      { name: "Emma Davis", role: "Android Developer", avatar: "" },
      { name: "Frank Wilson", role: "UI/UX Designer", avatar: "" },
    ],
    tasks: { total: 62, completed: 28 },
  },
  {
    id: 3,
    name: "Data Analytics Dashboard",
    description: "Real-time analytics and reporting system for business insights",
    status: "completed",
    priority: "medium",
    progress: 100,
    budget: 95000,
    spent: 92000,
    startDate: "2023-09-01",
    endDate: "2024-03-15",
    team: [
      { name: "Grace Miller", role: "Data Engineer", avatar: "" },
      { name: "Henry Taylor", role: "Full Stack Dev", avatar: "" },
    ],
    tasks: { total: 35, completed: 35 },
  },
  {
    id: 4,
    name: "CRM System Integration",
    description: "Integrate Salesforce with existing systems and workflows",
    status: "planning",
    priority: "medium",
    progress: 15,
    budget: 75000,
    spent: 11250,
    startDate: "2024-08-01",
    endDate: "2024-11-30",
    team: [
      { name: "Ivy Anderson", role: "Integration Specialist", avatar: "" },
      { name: "Jack Brown", role: "DevOps Engineer", avatar: "" },
    ],
    tasks: { total: 28, completed: 4 },
  },
  {
    id: 5,
    name: "Security Audit & Compliance",
    description: "Comprehensive security review and GDPR compliance implementation",
    status: "in-progress",
    priority: "critical",
    progress: 80,
    budget: 65000,
    spent: 52000,
    startDate: "2024-05-01",
    endDate: "2024-10-31",
    team: [
      { name: "Kate Martinez", role: "Security Expert", avatar: "" },
      { name: "Liam Garcia", role: "Compliance Officer", avatar: "" },
    ],
    tasks: { total: 22, completed: 18 },
  },
  {
    id: 6,
    name: "Marketing Website Revamp",
    description: "New marketing site with SEO optimization and content management",
    status: "completed",
    priority: "low",
    progress: 100,
    budget: 45000,
    spent: 43500,
    startDate: "2023-11-01",
    endDate: "2024-02-28",
    team: [
      { name: "Mike Rodriguez", role: "Web Developer", avatar: "" },
      { name: "Nina Clark", role: "Content Strategist", avatar: "" },
    ],
    tasks: { total: 18, completed: 18 },
  },
  {
    id: 7,
    name: "API Microservices Migration",
    description: "Migrate monolithic architecture to microservices",
    status: "on-hold",
    priority: "medium",
    progress: 30,
    budget: 150000,
    spent: 45000,
    startDate: "2024-04-01",
    endDate: "2025-03-31",
    team: [
      { name: "Oliver Lewis", role: "Solutions Architect", avatar: "" },
      { name: "Paula Walker", role: "Backend Developer", avatar: "" },
    ],
    tasks: { total: 52, completed: 16 },
  },
  {
    id: 8,
    name: "Customer Support Portal",
    description: "Self-service portal with AI chatbot and ticket system",
    status: "in-progress",
    priority: "high",
    progress: 55,
    budget: 88000,
    spent: 48400,
    startDate: "2024-06-01",
    endDate: "2024-12-15",
    team: [
      { name: "Quinn Hall", role: "Frontend Developer", avatar: "" },
      { name: "Rachel Young", role: "AI Specialist", avatar: "" },
      { name: "Steve Allen", role: "UX Designer", avatar: "" },
    ],
    tasks: { total: 41, completed: 23 },
  },
]

const statusColors = {
  "completed": "bg-green-500",
  "in-progress": "bg-blue-500",
  "planning": "bg-yellow-500",
  "on-hold": "bg-gray-500",
  "critical": "bg-red-500",
}

const priorityColors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  "critical": "destructive",
  "high": "default",
  "medium": "secondary",
  "low": "outline",
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(142, 76%, 36%)",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(221, 83%, 53%)",
  },
  planning: {
    label: "Planning",
    color: "hsl(48, 96%, 53%)",
  },
  onHold: {
    label: "On Hold",
    color: "hsl(215, 14%, 34%)",
  },
} satisfies ChartConfig

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  // Filter projects
  const filteredProjects = projectsData.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Calculate statistics
  const totalProjects = projectsData.length
  const completedProjects = projectsData.filter(p => p.status === "completed").length
  const inProgressProjects = projectsData.filter(p => p.status === "in-progress").length
  const totalBudget = projectsData.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projectsData.reduce((sum, p) => sum + p.spent, 0)
  const avgProgress = Math.round(projectsData.reduce((sum, p) => sum + p.progress, 0) / totalProjects)

  // Status distribution data
  const statusData = [
    { name: "Completed", value: projectsData.filter(p => p.status === "completed").length, fill: "var(--color-completed)" },
    { name: "In Progress", value: projectsData.filter(p => p.status === "in-progress").length, fill: "var(--color-inProgress)" },
    { name: "Planning", value: projectsData.filter(p => p.status === "planning").length, fill: "var(--color-planning)" },
    { name: "On Hold", value: projectsData.filter(p => p.status === "on-hold").length, fill: "var(--color-onHold)" },
  ]

  // Budget comparison data
  const budgetData = projectsData.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    budget: p.budget,
    spent: p.spent,
  }))

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects in one place
          </p>
        </div>
        <Button>+ New Project</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              ${(totalSpent / 1000).toFixed(0)}K spent ({Math.round((totalSpent / totalBudget) * 100)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>Overview of project statuses</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  label={(entry) => `${entry.value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget vs Spent</CardTitle>
            <CardDescription>Financial overview by project</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={budgetData.slice(0, 5)}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  fontSize={12}
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
                <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Filter and search through your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-[300px]"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="md:w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-1">{project.description}</CardDescription>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant={priorityColors[project.priority as keyof typeof priorityColors]}>
                  {project.priority}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {project.status.replace("-", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${statusColors[project.status as keyof typeof statusColors]}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasks</span>
                <span className="font-medium">
                  {project.tasks.completed} / {project.tasks.total}
                </span>
              </div>

              {/* Budget */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">
                  ${(project.spent / 1000).toFixed(0)}K / ${(project.budget / 1000).toFixed(0)}K
                </span>
              </div>

              {/* Timeline */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Timeline</span>
                <span className="font-medium">
                  {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                  {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Team */}
              <div>
                <span className="text-sm text-muted-foreground">Team</span>
                <div className="flex -space-x-2 mt-2">
                  {project.team.map((member, idx) => (
                    <Avatar key={idx} className="border-2 border-background">
                      <AvatarFallback className="text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.team.length > 0 && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border-2 border-background text-xs font-medium">
                      +{project.team.length}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <div className="border-t p-4">
              <Button className="w-full" variant="outline" size="sm">
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No projects found matching your filters.</p>
            <Button className="mt-4" variant="outline" onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setPriorityFilter("all")
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
