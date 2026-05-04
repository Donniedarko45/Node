import { RegistarForm } from "@/features/auth/components/register-forum";
import { requireUnAuth } from "@/lib/auth.utils";
import Image from "next/image";
import Link from "next/link";

const Page = async () => {
  await requireUnAuth();

  return <RegistarForm />;
};

export default Page;
