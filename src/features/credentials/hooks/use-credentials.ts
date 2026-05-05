"use client";

import { useTRPC } from "@/trpc/client";
import {
  useQueryClient,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useCredentialsParams } from "./use-credentials-params";

export const useCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();
  return useSuspenseQuery(trpc.credentials.getMany.queryOptions(params));
};

export const useCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

export const useCreateCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
      },
    })
  );
};

export const useRemoveCredential = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.remove.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
      },
    })
  );
};

export const useUpdateCredentialName = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.credentials.updateName.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.credentials.getMany.queryOptions({})
        );
      },
    })
  );
};
