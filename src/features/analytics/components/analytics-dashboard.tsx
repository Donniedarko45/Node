"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  ActivityIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  ZapIcon,
  BarChart3Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for demo - in production, this would come from tRPC
const mockAnalytics = {
  totalExecutions: 2847,
  successRate: 96.8,
  avgDuration: 3.2,
  totalWorkflows: 18,
  executionsTrend: +18.3,
  successRateTrend: +3.2,
  durationTrend: -12.4,
  recentExecutions: [
    { 
      id: "exec_2k4j8h3g", 
      workflow: "AI Content Generator", 
      status: "SUCCESS", 
      duration: 2.8, 
      timestamp: "2 minutes ago",
      nodes: 4,
      cost: "$0.023"
    },
    { 
      id: "exec_9m2n5p1q", 
      workflow: "Customer Support AI", 
      status: "SUCCESS", 
      duration: 4.2, 
      timestamp: "8 minutes ago",
      nodes: 5,
      cost: "$0.041"
    },
    { 
      id: "exec_7k3h9j2m", 
      workflow: "Data Enrichment Pipeline", 
      status: "FAILED", 
      duration: 1.3, 
      timestamp: "15 minutes ago",
      nodes: 6,
      cost: "$0.008"
    },
    { 
      id: "exec_5n8p2k4j", 
      workflow: "Social Media Monitor", 
      status: "SUCCESS", 
      duration: 3.7, 
      timestamp: "23 minutes ago",
      nodes: 5,
      cost: "$0.032"
    },
    { 
      id: "exec_1m9k7h3n", 
      workflow: "Multi-AI Comparison", 
      status: "SUCCESS", 
      duration: 6.4, 
      timestamp: "31 minutes ago",
      nodes: 5,
      cost: "$0.089"
    },
    { 
      id: "exec_3p5j8k2m", 
      workflow: "Email Campaign Automation", 
      status: "SUCCESS", 
      duration: 2.1, 
      timestamp: "42 minutes ago",
      nodes: 4,
      cost: "$0.018"
    },
    { 
      id: "exec_8h4n9m1k", 
      workflow: "Lead Scoring System", 
      status: "SUCCESS", 
      duration: 5.3, 
      timestamp: "1 hour ago",
      nodes: 7,
      cost: "$0.067"
    },
  ],
  topWorkflows: [
    { name: "AI Content Generator", executions: 487, successRate: 98.6, avgDuration: 2.8 },
    { name: "Customer Support AI", executions: 423, successRate: 96.2, avgDuration: 4.1 },
    { name: "Data Enrichment Pipeline", executions: 389, successRate: 94.8, avgDuration: 3.9 },
    { name: "Social Media Monitor", executions: 356, successRate: 97.4, avgDuration: 3.2 },
    { name: "Multi-AI Comparison", executions: 312, successRate: 99.3, avgDuration: 6.1 },
    { name: "Email Campaign Automation", executions: 278, successRate: 95.7, avgDuration: 2.3 },
    { name: "Lead Scoring System", executions: 234, successRate: 93.6, avgDuration: 5.2 },
    { name: "Invoice Processing", executions: 189, successRate: 98.9, avgDuration: 1.8 },
  ],
  executionsByHour: [
    { hour: "00:00", count: 23, success: 22, failed: 1 },
    { hour: "02:00", count: 18, success: 17, failed: 1 },
    { hour: "04:00", count: 15, success: 15, failed: 0 },
    { hour: "06:00", count: 34, success: 33, failed: 1 },
    { hour: "08:00", count: 89, success: 86, failed: 3 },
    { hour: "10:00", count: 142, success: 138, failed: 4 },
    { hour: "12:00", count: 167, success: 162, failed: 5 },
    { hour: "14:00", count: 198, success: 191, failed: 7 },
    { hour: "16:00", count: 156, success: 151, failed: 5 },
    { hour: "18:00", count: 123, success: 119, failed: 4 },
    { hour: "20:00", count: 87, success: 84, failed: 3 },
    { hour: "22:00", count: 45, success: 44, failed: 1 },
  ],
  nodeTypeUsage: [
    { type: "OpenAI GPT-4", count: 1243, percentage: 43.7, avgCost: "$0.034" },
    { type: "HTTP Request", count: 892, percentage: 31.3, avgCost: "$0.000" },
    { type: "Anthropic Claude", count: 534, percentage: 18.8, avgCost: "$0.028" },
    { type: "Slack Webhook", count: 234, percentage: 8.2, avgCost: "$0.000" },
    { type: "Google Gemini", count: 178, percentage: 6.3, avgCost: "$0.012" },
    { type: "Discord Webhook", count: 156, percentage: 5.5, avgCost: "$0.000" },
    { type: "Stripe Trigger", count: 89, percentage: 3.1, avgCost: "$0.000" },
  ],
  costAnalysis: {
    totalCost: 127.43,
    avgCostPerExecution: 0.045,
    costTrend: -8.2,
    topCostWorkflows: [
      { name: "Multi-AI Comparison", cost: 27.89 },
      { name: "Customer Support AI", cost: 23.45 },
      { name: "AI Content Generator", cost: 19.67 },
    ]
  }
};

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your workflow performance and execution metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Executions"
          value={mockAnalytics.totalExecutions.toLocaleString()}
          trend={mockAnalytics.executionsTrend}
          icon={ActivityIcon}
          description="Last 30 days"
        />
        <MetricCard
          title="Success Rate"
          value={`${mockAnalytics.successRate}%`}
          trend={mockAnalytics.successRateTrend}
          icon={CheckCircle2Icon}
          description="Successful executions"
        />
        <MetricCard
          title="Avg Duration"
          value={`${mockAnalytics.avgDuration}s`}
          trend={mockAnalytics.durationTrend}
          icon={ClockIcon}
          description="Per execution"
          invertTrend
        />
        <MetricCard
          title="Active Workflows"
          value={mockAnalytics.totalWorkflows.toString()}
          icon={ZapIcon}
          description="Total workflows"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Workflows */}
        <Card>
          <CardHeader>
            <CardTitle>Top Workflows</CardTitle>
            <CardDescription>Most executed workflows this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.topWorkflows.map((workflow, index) => (
                <div key={workflow.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{workflow.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {workflow.executions} executions
                    </p>
                  </div>
                  <Badge variant={workflow.successRate > 95 ? "default" : "secondary"}>
                    {workflow.successRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Node Type Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Node Type Usage</CardTitle>
            <CardDescription>Most used node types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalytics.nodeTypeUsage.map((node) => (
                <div key={node.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{node.type}</span>
                    <span className="text-muted-foreground">
                      {node.count} ({node.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${node.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executions by Hour */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Activity</CardTitle>
          <CardDescription>Executions by time of day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {mockAnalytics.executionsByHour.map((data) => {
              const maxCount = Math.max(...mockAnalytics.executionsByHour.map((d) => d.count));
              const height = (data.count / maxCount) * 100;
              
              return (
                <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full group">
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 cursor-pointer"
                      style={{ height: `${height}%`, minHeight: "8px" }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.count} executions
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{data.hour}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
          <CardDescription>Latest workflow runs across all workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalytics.recentExecutions.map((execution) => (
              <div
                key={execution.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center size-10 rounded-full bg-muted">
                  {execution.status === "SUCCESS" ? (
                    <CheckCircle2Icon className="size-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="size-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{execution.workflow}</p>
                    <Badge variant="outline" className="text-xs">
                      {execution.nodes} nodes
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>{execution.timestamp}</span>
                    <span>•</span>
                    <span>ID: {execution.id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={execution.status === "SUCCESS" ? "default" : "destructive"}>
                    {execution.status}
                  </Badge>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">
                      {execution.duration}s
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-sm font-medium text-green-600">
                      {execution.cost}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  description,
  invertTrend = false,
}: {
  title: string;
  value: string;
  trend?: number;
  icon: React.ElementType;
  description: string;
  invertTrend?: boolean;
}) {
  const isPositive = invertTrend ? (trend ?? 0) < 0 : (trend ?? 0) > 0;
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <div className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
              <TrendIcon className="size-3 mr-1" />
              {Math.abs(trend)}%
            </div>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
