"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";

export const useExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  
  // Filter out null values - nuqs returns null but tRPC expects undefined
  const cleanParams = {
    page: params.page,
    pageSize: params.pageSize,
    ...(params.workflowId && { workflowId: params.workflowId }),
  };
  
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(cleanParams));
};

export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();
  
  // Filter out null values - nuqs returns null but tRPC expects undefined
  const cleanParams = {
    page: params.page,
    pageSize: params.pageSize,
    ...(params.workflowId && { workflowId: params.workflowId }),
  };
  
  return useSuspenseQuery(trpc.executions.getMany.queryOptions(cleanParams));
};

export const useExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};

export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.executions.getOne.queryOptions({ id }));
};

export const useWorkflowExecutions = (workflowId: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(
    trpc.executions.getByWorkflow.queryOptions({
      workflowId,
      page: 1,
      pageSize: 10,
    })
  );
};
