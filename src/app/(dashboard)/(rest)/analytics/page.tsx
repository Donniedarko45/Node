import { requireAuth } from "@/lib/auth.utils";
import { AnalyticsDashboard } from "@/features/analytics/components/analytics-dashboard";
import { HydrateClient } from "@/trpc/server";

const Page = async () => {
  await requireAuth();
  
  return (
    <HydrateClient>
      <AnalyticsDashboard />
    </HydrateClient>
  );
};

export default Page;
