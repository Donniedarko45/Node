import { requireAuth } from "@/lib/auth.utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import {
  ExecutionsContainer,
  ExecutionList,
  ExecutionLoading,
  ExecutionError,
} from "@/features/executions/components/executions";

const Page = async () => {
  await requireAuth();
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ExecutionError />}>
        <Suspense fallback={<ExecutionLoading />}>
          <ExecutionsContainer>
            <ExecutionList />
          </ExecutionsContainer>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;