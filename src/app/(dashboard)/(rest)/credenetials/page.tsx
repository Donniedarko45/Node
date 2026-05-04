import { requireAuth } from "@/lib/auth.utils";
import { HydrateClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import {
  CredentialsContainer,
  CredentialList,
  CredentialLoading,
  CredentialError,
} from "@/features/credentials/components/credentials";

const Page = async () => {
  await requireAuth();
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<CredentialError />}>
        <Suspense fallback={<CredentialLoading />}>
          <CredentialsContainer>
            <CredentialList />
          </CredentialsContainer>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;