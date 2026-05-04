import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth.utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import {
  WorkflowList,
  WorkflowLoading,
  WorkflowsContainer,
  WorkflowError

} from "@/features/workflows/components/workflows";

type Props = {
  searchParams: Promise<SearchParams>,

}

import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { SearchParams } from "nuqs/server";

const Page = async ({searchParams}: Props) => {
  await requireAuth();

  const params = await  workflowsParamsLoader(searchParams);

  prefetchWorkflows(params);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<WorkflowError/>}>
          <Suspense fallback={<WorkflowLoading/>}>
            <WorkflowList />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default Page;
