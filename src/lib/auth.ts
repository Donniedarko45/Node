import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth, check } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";
import { polarClient } from "./polar";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "8b1767fe-754e-4d4f-8a1d-a5250045443a",
              slug: "Nodebase-pro", // Custom slug for easy reference in Checkout URL, e.g. /checkout/Nodebase-pro
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
