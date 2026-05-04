import { useTRPC as trpc } from "@/trpc/client";
import { useExecutionsParams } from "./use-executions-params";

export const useExecutions = () => {
  const [params] = useExecutionsParams();
  return trpc.executions.getMany.useSuspenseQuery(params);
};

export const useSuspenseExecutions = () => {
  const [params] = useExecutionsParams();
  return trpc.executions.getMany.useSuspenseQuery(params);
};

export const useExecution = (id: string) => {
  return trpc.executions.getOne.useSuspenseQuery({ id });
};

export const useSuspenseExecution = (id: string) => {
  return trpc.executions.getOne.useSuspenseQuery({ id });
};

export const useWorkflowExecutions = (workflowId: string) => {
  return trpc.executions.getByWorkflow.useSuspenseQuery({
    workflowId,
    page: 1,
    pageSize: 10,
  });
};
