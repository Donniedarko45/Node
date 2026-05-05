"use client";

import React from "react";
import { formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
import { useSuspenseExecution } from "../hooks/use-executions";
import {
  CheckCircle2Icon,
  XCircleIcon,
  LoaderIcon,
  PlayIcon,
  ArrowLeftIcon,
  ClockIcon,
  CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutionStatus } from "@/generated/prisma/enums";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-6 text-green-500" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-6 text-red-500" />;
    case ExecutionStatus.RUNNING:
      return <LoaderIcon className="size-6 text-blue-500 animate-spin" />;
    default:
      return <PlayIcon className="size-6 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <Badge variant="default" className="bg-green-500 text-white">Success</Badge>;
    case ExecutionStatus.FAILED:
      return <Badge variant="destructive">Failed</Badge>;
    case ExecutionStatus.RUNNING:
      return <Badge variant="secondary">Running</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getDuration = (startedAt: Date, completedAt: Date | null) => {
  if (!completedAt) return "Running...";
  
  const duration = intervalToDuration({
    start: startedAt,
    end: completedAt,
  });

  return formatDuration(duration, {
    format: ["hours", "minutes", "seconds"],
    zero: true,
  });
};

export const ExecutionDetail = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/executions">
              <ArrowLeftIcon className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Execution Details</h1>
            <p className="text-sm text-muted-foreground">
              {execution.workflow?.name || "Unknown Workflow"}
            </p>
          </div>
        </div>
        {getStatusBadge(execution.status)}
      </div>

      <Separator />

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStatusIcon(execution.status)}
            <div>
              <CardTitle>Execution Status</CardTitle>
              <CardDescription>
                Current state and timing information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="size-4" />
                <span>Started</span>
              </div>
              <p className="text-sm font-medium">
                {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(execution.startedAt).toLocaleString()}
              </p>
            </div>

            {execution.completedAt && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="size-4" />
                  <span>Completed</span>
                </div>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(execution.completedAt, { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(execution.completedAt).toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClockIcon className="size-4" />
                <span>Duration</span>
              </div>
              <p className="text-sm font-medium">
                {getDuration(execution.startedAt, execution.completedAt)}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Execution ID</p>
            <p className="text-sm font-mono">{execution.id}</p>
          </div>

          {execution.inngestEventId && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Inngest Event ID</p>
              <p className="text-sm font-mono">{execution.inngestEventId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Card */}
      {execution.output && (
        <Card>
          <CardHeader>
            <CardTitle>Execution Output</CardTitle>
            <CardDescription>
              Data returned from the workflow execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{JSON.stringify(execution.output, null, 2)}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Error Stack Card */}
      {execution.errorStack && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Error Details</CardTitle>
            <CardDescription>
              Stack trace and error information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="mb-4">
                  Toggle Error Stack
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="bg-red-50 dark:bg-red-950 p-4 rounded-lg overflow-x-auto text-xs text-red-900 dark:text-red-100">
                  <code>{JSON.stringify(execution.errorStack, null, 2)}</code>
                </pre>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      {/* Workflow Link */}
      <Card>
        <CardHeader>
          <CardTitle>Related Workflow</CardTitle>
          <CardDescription>
            View or edit the workflow that was executed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={`/workflows/${execution.workflowId}`}>
              Open Workflow: {execution.workflow?.name || "Unknown"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
