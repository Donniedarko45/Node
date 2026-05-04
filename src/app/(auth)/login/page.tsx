import { LoginForm } from "@/features/auth/components/login-forum";
import { requireUnAuth } from "@/lib/auth.utils";


const Page = async () => {
  await requireUnAuth();
  return (
   <LoginForm></LoginForm>
  );
};

export default Page;
