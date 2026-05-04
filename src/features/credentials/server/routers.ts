import { prisma } from "@/lib/db";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { Pagination } from "@/config/constant";
import { CredentialType } from "@/generated/prisma/enums";
import Cryptr from "cryptr";

const cryptr = new Cryptr(process.env.ENCRYPTION_KEY || "default-secret-key");

export const credentialsRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.nativeEnum(CredentialType),
        value: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const encryptedValue = cryptr.encrypt(input.value);

      return prisma.credential.create({
        data: {
          name: input.name,
          type: input.type,
          value: encryptedValue,
          userId: ctx.auth.user.id,
        },
      });
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.credential.delete({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });
    }),

  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return prisma.credential.update({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
        data: { name: input.name },
      });
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const credential = await prisma.credential.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      // Don't send decrypted value to client
      return {
        ...credential,
        value: "***ENCRYPTED***",
      };
    }),

  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(Pagination.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(Pagination.MIN_PAGE_SIZE)
          .max(Pagination.MAX_PAGE_SIZE)
          .default(Pagination.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        type: z.nativeEnum(CredentialType).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, type } = input;
      const [items, totalCount] = await Promise.all([
        prisma.credential.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where: {
            userId: ctx.auth.user.id,
            name: {
              contains: search,
              mode: "insensitive",
            },
            ...(type && { type }),
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.credential.count({
          where: {
            userId: ctx.auth.user.id,
            ...(type && { type }),
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      // Mask values
      const maskedItems = items.map((item) => ({
        ...item,
        value: "***ENCRYPTED***",
      }));

      return {
        items: maskedItems,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  // Server-side only: decrypt credential value
  getDecrypted: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const credential = await prisma.credential.findUniqueOrThrow({
        where: {
          id: input.id,
          userId: ctx.auth.user.id,
        },
      });

      const decryptedValue = cryptr.decrypt(credential.value);

      return {
        ...credential,
        value: decryptedValue,
      };
    }),
});
