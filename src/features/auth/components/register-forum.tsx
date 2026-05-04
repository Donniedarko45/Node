"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string(),
}).refine((data)=>data.password == data.confirmPassword,{
    message:"passwords dont match",
    path:["confirmPassword"]
});

type registerFormValues = z.infer<typeof registerSchema>;

export function RegistarForm() {
  const router = useRouter();

  const form = useForm<registerFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword:"",
    },
  });

  const onSubmit = async (values: registerFormValues) => {
    await authClient.signUp.email({
        name: values.email,
        email : values.email,
        password: values.password,
        callbackURL: "/",
    },{
        onSuccess: ()=>{
             router.push("/")
        },
        onError:(err)=>{
            toast.error(err.error.message);

        }
    });
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Create your Account to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-6"
            >
              <div className="flex flex-col gap-4">
                <Button variant="outline" type="button" disabled={isPending}>
                  <Image src="/logos/github.svg" alt="github" height={20} width={20}/>
                  Continue with GitHub
                </Button>

                <Button variant="outline" type="button" disabled={isPending}>
                  <Image src="/logos/google.svg" alt="google" height={20} width={20}/>
                  Continue with Google
                </Button>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>   
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? "Sign up..." : "Sign up"}
              </Button>
              <div className="text-center"> Already have an Account!{" "}
                <Link href="/login" className=" underline underline-offset-4">Login in</Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
