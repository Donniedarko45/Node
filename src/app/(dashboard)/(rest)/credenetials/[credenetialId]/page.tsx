import { requireAuth } from "@/lib/auth.utils";

interface pageProps {
  params: Promise<{
    credenetialId: string;
  }>;
}

const Page = async ({ params }: pageProps) => {
  await requireAuth();
  const { credenetialId } = await params;

  return <div>credenetials id : {credenetialId} </div>;
};

export default Page;
