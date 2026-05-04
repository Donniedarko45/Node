import { useTRPC as trpc } from "@/trpc/client";
import { useCredentialsParams } from "./use-credentials-params";

export const useCredentials = () => {
  const [params] = useCredentialsParams();
  return trpc.credentials.getMany.useSuspenseQuery(params);
};

export const useSuspenseCredentials = () => {
  const [params] = useCredentialsParams();
  return trpc.credentials.getMany.useSuspenseQuery(params);
};

export const useCredential = (id: string) => {
  return trpc.credentials.getOne.useSuspenseQuery({ id });
};

export const useSuspenseCredential = (id: string) => {
  return trpc.credentials.getOne.useSuspenseQuery({ id });
};

export const useCreateCredential = () => {
  const utils = trpc.useUtils();
  return trpc.credentials.create.useMutation({
    onSuccess: () => {
      utils.credentials.getMany.invalidate();
    },
  });
};

export const useRemoveCredential = () => {
  const utils = trpc.useUtils();
  return trpc.credentials.remove.useMutation({
    onSuccess: () => {
      utils.credentials.getMany.invalidate();
    },
  });
};

export const useUpdateCredentialName = () => {
  const utils = trpc.useUtils();
  return trpc.credentials.updateName.useMutation({
    onSuccess: () => {
      utils.credentials.getMany.invalidate();
    },
  });
};
