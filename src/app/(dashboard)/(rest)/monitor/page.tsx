import { requireAuth } from "@/lib/auth.utils";
import { LiveExecutionMonitor } from "@/features/monitor/components/live-execution-monitor";
import { HydrateClient } from "@/trpc/server";

const Page = async () => {
  await requireAuth();
  
  return (
    <HydrateClient>
      <LiveExecutionMonitor />
    </HydrateClient>
  );
};

export default Page;
