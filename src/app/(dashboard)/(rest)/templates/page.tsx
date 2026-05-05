import { requireAuth } from "@/lib/auth.utils";
import { TemplateGallery } from "@/features/templates/components/template-gallery";
import { HydrateClient } from "@/trpc/server";

const Page = async () => {
  await requireAuth();
  
  return (
    <HydrateClient>
      <TemplateGallery />
    </HydrateClient>
  );
};

export default Page;
