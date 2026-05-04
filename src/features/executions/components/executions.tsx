"use client";

import React from "react";
import { formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
import { useSuspenseExecutions } from "../hooks/use-executions";
import {
  EntityContainer,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItem,
} from "@/components/entity-components";
import { useExecutionsParams } from "../hooks/use-executions-params";
import type { Execution, Workflow } from "@/generated/prisma/client";
import {
  CheckCircle2Icon,
  XCircleIcon,
  LoaderIcon,
  PlayIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExecutionStatus } from "@/generated/prisma/enums";

export const ExecutionList = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution: any) => execution.id}
      renderItems={(execution: any) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
    />
  );
};

export const ExecutionPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Executions</h2>
          <p className="text-sm text-muted-foreground">
            View execution history and logs
          </p>
        </div>
      }
      pagination={<ExecutionPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const ExecutionLoading = () => {
  return <LoadingView entity="executions" message="Executions loading" />;
};

export const ExecutionError = () => {
  return <ErrorView message="Error loading executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions yet. Run a workflow to see execution history here" />
  );
};

const getStatusIcon = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <CheckCircle2Icon className="size-5 text-green-500" />;
    case ExecutionStatus.FAILED:
      return <XCircleIcon className="size-5 text-red-500" />;
    case ExecutionStatus.RUNNING:
      return <LoaderIcon className="size-5 text-blue-500 animate-spin" />;
    default:
      return <PlayIcon className="size-5 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
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
    format: ["minutes", "seconds"],
    zero: true,
  });
};

export const ExecutionItem = ({
  data,
}: {
  data: Execution & { workflow?: Pick<Workflow, "id" | "name"> };
}) => {
  return (
    <EntityItem
      href={`/executions/${data.id}`}
      title={data.workflow?.name || "Unknown Workflow"}
      subtitle={
        <>
          Started {formatDistanceToNow(data.startedAt, { addSuffix: true })}
          {data.completedAt && (
            <>
              {" "}
              &bull; Duration: {getDuration(data.startedAt, data.completedAt)}
            </>
          )}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          {getStatusIcon(data.status)}
        </div>
      }
      badge={getStatusBadge(data.status)}
    />
  );
};
