import { AuthLayout } from "@/features/auth/components/auth-layout";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout>{children}</AuthLayout>;
};

export default Layout;
