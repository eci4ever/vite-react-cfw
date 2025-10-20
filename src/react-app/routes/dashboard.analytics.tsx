import { createFileRoute } from '@tanstack/react-router'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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

export const Route = createFileRoute('/dashboard/analytics')({
  component: RouteComponent,
})

// Mock revenue data from January to December
const revenueData = [
  { month: "January", revenue: 45000, expenses: 28000 },
  { month: "February", revenue: 52000, expenses: 31000 },
  { month: "March", revenue: 48000, expenses: 29000 },
  { month: "April", revenue: 61000, expenses: 35000 },
  { month: "May", revenue: 55000, expenses: 32000 },
  { month: "June", revenue: 67000, expenses: 38000 },
  { month: "July", revenue: 72000, expenses: 41000 },
  { month: "August", revenue: 68000, expenses: 39000 },
  { month: "September", revenue: 74000, expenses: 42000 },
  { month: "October", revenue: 81000, expenses: 45000 },
  { month: "November", revenue: 78000, expenses: 44000 },
  { month: "December", revenue: 89000, expenses: 48000 },
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
} satisfies ChartConfig

function RouteComponent() {
  // Calculate total revenue and expenses
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalExpenses = revenueData.reduce((sum, item) => sum + item.expenses, 0)
  const netProfit = totalRevenue - totalExpenses

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Revenue and expenses overview for the year
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual revenue for the year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual expenses for the year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue minus expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue & Expenses</CardTitle>
          <CardDescription>
            Comparison of revenue and expenses by month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <BarChart data={revenueData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
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
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                fill="var(--color-expenses)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Monthly revenue trend throughout the year
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
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
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
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
