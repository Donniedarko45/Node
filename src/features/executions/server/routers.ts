import { prisma } from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { Pagination } from "@/config/constant";
import { ExecutionStatus } from "@/generated/prisma/enums";

export const executionsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const execution = await prisma.execution.findFirst({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!execution) {
        throw new Error("Execution not found or unauthorized");
      }

      return execution;
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
        workflowId: z.string().optional(),
        status: z.nativeEnum(ExecutionStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, workflowId, status } = input;

      const where = {
        workflow: {
          userId: ctx.auth.user.id,
        },
        ...(workflowId && { workflowId }),
        ...(status && { status }),
      };

      const [items, totalCount] = await Promise.all([
        prisma.execution.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where,
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            startedAt: "desc",
          },
        }),
        prisma.execution.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  getByWorkflow: protectedProcedure
    .input(
      z.object({
        workflowId: z.string(),
        page: z.number().default(Pagination.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(Pagination.MIN_PAGE_SIZE)
          .max(Pagination.MAX_PAGE_SIZE)
          .default(Pagination.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { workflowId, page, pageSize } = input;

      // Verify workflow belongs to user
      await prisma.workflow.findUniqueOrThrow({
        where: {
          id: workflowId,
          userId: ctx.auth.user.id,
        },
      });

      const where = { workflowId };

      const [items, totalCount] = await Promise.all([
        prisma.execution.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where,
          orderBy: {
            startedAt: "desc",
          },
        }),
        prisma.execution.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
});
