import { requireAuth } from "@/lib/auth.utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { ExecutionDetail } from "@/features/executions/components/execution-detail";
import { ExecutionLoading, ExecutionError } from "@/features/executions/components/executions";

interface pageProps {
  params: Promise<{
    executionId: string;
  }>;
}

const Page = async ({ params }: pageProps) => {
  await requireAuth();
  const { executionId } = await params;

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<ExecutionError />}>
        <Suspense fallback={<ExecutionLoading />}>
          <ExecutionDetail executionId={executionId} />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
