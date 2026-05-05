"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ActivityIcon,
  CheckCircle2Icon,
  XCircleIcon,
  LoaderIcon,
  PlayIcon,
  PauseIcon,
  RefreshCwIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveExecution {
  id: string;
  workflowName: string;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  currentNode: string;
  progress: number;
  startedAt: Date;
  duration: number;
  nodes: Array<{
    id: string;
    name: string;
    status: "pending" | "running" | "success" | "failed";
    duration?: number;
  }>;
}

// Mock live executions for demo
const generateMockExecutions = (): LiveExecution[] => {
  return [
    {
      id: "exec_live_2k4j8h3g",
      workflowName: "AI Content Generator",
      status: "RUNNING",
      currentNode: "Generate Blog Post with GPT-4",
      progress: 65,
      startedAt: new Date(Date.now() - 4200),
      duration: 4.2,
      nodes: [
        { id: "node_trigger_1", name: "Manual Trigger", status: "success", duration: 0.08 },
        { id: "node_openai_1", name: "Generate Blog Post with GPT-4", status: "running" },
        { id: "node_slack_1", name: "Post to #marketing Slack", status: "pending" },
        { id: "node_discord_1", name: "Post to Discord #content", status: "pending" },
      ],
    },
    {
      id: "exec_live_9m2n5p1q",
      workflowName: "Customer Support AI",
      status: "SUCCESS",
      currentNode: "Send Response via API",
      progress: 100,
      startedAt: new Date(Date.now() - 11500),
      duration: 11.5,
      nodes: [
        { id: "node_trigger_2", name: "Webhook: New Support Ticket", status: "success", duration: 0.12 },
        { id: "node_http_1", name: "Fetch Customer Profile", status: "success", duration: 1.34 },
        { id: "node_anthropic_1", name: "Analyze with Claude 3.5 Sonnet", status: "success", duration: 7.89 },
        { id: "node_http_2", name: "Send Response via API", status: "success", duration: 2.15 },
      ],
    },
    {
      id: "exec_live_7k3h9j2m",
      workflowName: "Data Enrichment Pipeline",
      status: "RUNNING",
      currentNode: "Analyze with Gemini 2.0",
      progress: 78,
      startedAt: new Date(Date.now() - 7800),
      duration: 7.8,
      nodes: [
        { id: "node_trigger_3", name: "Google Form Submission", status: "success", duration: 0.09 },
        { id: "node_http_3", name: "Fetch Company Data (Clearbit)", status: "success", duration: 2.45 },
        { id: "node_http_4", name: "Fetch Social Data (Twitter API)", status: "success", duration: 1.67 },
        { id: "node_gemini_1", name: "Analyze with Gemini 2.0", status: "running" },
        { id: "node_http_5", name: "Save to PostgreSQL Database", status: "pending" },
      ],
    },
    {
      id: "exec_live_5n8p2k4j",
      workflowName: "Email Campaign Automation",
      status: "RUNNING",
      currentNode: "Generate Email with GPT-4",
      progress: 42,
      startedAt: new Date(Date.now() - 3100),
      duration: 3.1,
      nodes: [
        { id: "node_trigger_4", name: "Stripe: Payment Successful", status: "success", duration: 0.11 },
        { id: "node_http_6", name: "Fetch User Profile", status: "success", duration: 0.89 },
        { id: "node_openai_2", name: "Generate Email with GPT-4", status: "running" },
        { id: "node_http_7", name: "Send via SendGrid API", status: "pending" },
        { id: "node_slack_2", name: "Notify Sales Team", status: "pending" },
      ],
    },
    {
      id: "exec_live_1m9k7h3n",
      workflowName: "Lead Scoring System",
      status: "SUCCESS",
      currentNode: "Update CRM",
      progress: 100,
      startedAt: new Date(Date.now() - 15200),
      duration: 15.2,
      nodes: [
        { id: "node_trigger_5", name: "Manual Trigger", status: "success", duration: 0.07 },
        { id: "node_http_8", name: "Fetch Lead Data", status: "success", duration: 1.23 },
        { id: "node_http_9", name: "Enrich with LinkedIn", status: "success", duration: 3.45 },
        { id: "node_openai_3", name: "Score Lead with GPT-4", status: "success", duration: 8.67 },
        { id: "node_http_10", name: "Update CRM (Salesforce)", status: "success", duration: 1.78 },
      ],
    },
  ];
};

export function LiveExecutionMonitor() {
  const [executions, setExecutions] = useState<LiveExecution[]>(generateMockExecutions());
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setExecutions((prev) =>
        prev.map((exec) => {
          if (exec.status === "RUNNING") {
            const newProgress = Math.min(exec.progress + Math.random() * 10, 100);
            const newDuration = exec.duration + 1;

            // Simulate completion
            if (newProgress >= 100) {
              return {
                ...exec,
                status: Math.random() > 0.1 ? "SUCCESS" : "FAILED",
                progress: 100,
                duration: newDuration,
                nodes: exec.nodes.map((node) => ({
                  ...node,
                  status: node.status === "pending" ? "success" : node.status,
                  duration: node.duration || Math.random() * 3,
                })),
              };
            }

            // Update current node
            const runningNodeIndex = exec.nodes.findIndex((n) => n.status === "running");
            const updatedNodes = exec.nodes.map((node, index) => {
              if (index < runningNodeIndex) return { ...node, status: "success" as const };
              if (index === runningNodeIndex) return { ...node, status: "running" as const };
              return node;
            });

            return {
              ...exec,
              progress: newProgress,
              duration: newDuration,
              nodes: updatedNodes,
            };
          }
          return exec;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  const runningCount = executions.filter((e) => e.status === "RUNNING").length;
  const successCount = executions.filter((e) => e.status === "SUCCESS").length;
  const failedCount = executions.filter((e) => e.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Live Execution Monitor</h1>
          <p className="text-muted-foreground">
            Real-time workflow execution tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExecutions(generateMockExecutions())}
          >
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={isLive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? (
              <>
                <PauseIcon className="size-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="size-4 mr-2" />
                Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <LoaderIcon className="size-4 text-blue-500 animate-spin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningCount}</div>
            <p className="text-xs text-muted-foreground">Active executions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2Icon className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successCount}</div>
            <p className="text-xs text-muted-foreground">Completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircleIcon className="size-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCount}</div>
            <p className="text-xs text-muted-foreground">Execution errors</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Executions */}
      <div className="space-y-4">
        {executions.map((execution) => (
          <ExecutionCard key={execution.id} execution={execution} />
        ))}
      </div>
    </div>
  );
}

function ExecutionCard({ execution }: { execution: LiveExecution }) {
  const statusIcon = {
    RUNNING: <LoaderIcon className="size-5 text-blue-500 animate-spin" />,
    SUCCESS: <CheckCircle2Icon className="size-5 text-green-500" />,
    FAILED: <XCircleIcon className="size-5 text-red-500" />,
  };

  const statusColor = {
    RUNNING: "bg-blue-500",
    SUCCESS: "bg-green-500",
    FAILED: "bg-red-500",
  };

  const completedNodes = execution.nodes.filter(n => n.status === "success").length;
  const totalNodes = execution.nodes.length;

  return (
    <Card className={cn(
      "transition-all",
      execution.status === "RUNNING" && "ring-2 ring-blue-500/20 shadow-lg"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusIcon[execution.status]}
            <div>
              <CardTitle className="text-lg">{execution.workflowName}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {execution.status === "RUNNING" && (
                  <>
                    <span className="flex items-center gap-1">
                      <ActivityIcon className="size-3" />
                      {execution.currentNode}
                    </span>
                    <span>•</span>
                    <span className="text-xs">{completedNodes}/{totalNodes} nodes completed</span>
                  </>
                )}
                {execution.status === "SUCCESS" && (
                  <>
                    <span>Completed successfully</span>
                    <span>•</span>
                    <span className="text-xs">{totalNodes} nodes executed</span>
                  </>
                )}
                {execution.status === "FAILED" && "Execution failed"}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={execution.status === "SUCCESS" ? "default" : execution.status === "FAILED" ? "destructive" : "secondary"}>
              {execution.status}
            </Badge>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <ClockIcon className="size-3" />
              <span>{execution.duration.toFixed(1)}s</span>
              <span>•</span>
              <span>ID: {execution.id.slice(-8)}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(execution.progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                statusColor[execution.status]
              )}
              style={{ width: `${execution.progress}%` }}
            />
          </div>
        </div>

        {/* Node Timeline */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Execution Timeline</p>
          {execution.nodes.map((node, index) => (
            <div key={node.id} className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center size-8 rounded-full border-2 transition-all",
                node.status === "success" && "bg-green-500 border-green-500",
                node.status === "running" && "bg-blue-500 border-blue-500 animate-pulse",
                node.status === "failed" && "bg-red-500 border-red-500",
                node.status === "pending" && "bg-muted border-muted"
              )}>
                {node.status === "success" && <CheckCircle2Icon className="size-4 text-white" />}
                {node.status === "running" && <LoaderIcon className="size-4 text-white animate-spin" />}
                {node.status === "failed" && <XCircleIcon className="size-4 text-white" />}
                {node.status === "pending" && <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  node.status === "pending" && "text-muted-foreground"
                )}>
                  {node.name}
                </p>
                {node.duration && (
                  <p className="text-xs text-muted-foreground">
                    Completed in {node.duration.toFixed(2)}s
                  </p>
                )}
                {node.status === "running" && (
                  <p className="text-xs text-blue-500">
                    Executing...
                  </p>
                )}
              </div>
              {node.status === "running" && (
                <Badge variant="secondary" className="animate-pulse">
                  <LoaderIcon className="size-3 mr-1 animate-spin" />
                  Running
                </Badge>
              )}
              {node.status === "success" && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ✓ Done
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
