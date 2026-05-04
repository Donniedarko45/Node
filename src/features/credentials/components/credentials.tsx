"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  useCreateCredential,
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import {
  EntityHeader,
  EntityContainer,
  EntitySearch,
  EntityPagination,
  LoadingView,
  ErrorView,
  EmptyView,
  EntityList,
  EntityItem,
} from "@/components/entity-components";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Credential } from "@/generated/prisma/client";
import { KeyIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CredentialType } from "@/generated/prisma/enums";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential: any) => credential.id}
      renderItems={(credential: any) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialHeader = ({ disabled }: { disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const createCredential = useCreateCredential();
  const { modal, handleError } = useUpgradeModal();

  const [formData, setFormData] = useState({
    name: "",
    type: CredentialType.OPENAI,
    value: "",
  });

  const handleCreate = () => {
    createCredential.mutate(formData, {
      onSuccess: () => {
        setIsOpen(false);
        setFormData({ name: "", type: CredentialType.OPENAI, value: "" });
      },
      onError: (error: any) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Credentials"
        description="Manage your API keys and credentials"
        onNew={() => setIsOpen(true)}
        newButtonLabel="New credential"
        disabled={disabled}
        isCreating={createCredential.isPending}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Credential</DialogTitle>
            <DialogDescription>
              Add a new API key or credential for your workflows
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My OpenAI Key"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: string) =>
                  setFormData({ ...formData, type: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CredentialType.OPENAI}>OpenAI</SelectItem>
                  <SelectItem value={CredentialType.ANTHROPIC}>
                    Anthropic
                  </SelectItem>
                  <SelectItem value={CredentialType.GEMINI}>Gemini</SelectItem>
                  <SelectItem value={CredentialType.DISCORD}>
                    Discord
                  </SelectItem>
                  <SelectItem value={CredentialType.SLACK}>Slack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">API Key</Label>
              <Input
                id="value"
                type="password"
                placeholder="sk-..."
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !formData.name || !formData.value || createCredential.isPending
              }
            >
              {createCredential.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const CredentialPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialHeader />}
      search={<CredentialsSearch />}
      pagination={<CredentialPagination />}
    >
      {children}
    </EntityContainer>
  );
};

export const CredentialLoading = () => {
  return <LoadingView entity="credentials" message="Credentials loading" />;
};

export const CredentialError = () => {
  return <ErrorView message="Error loading credentials" />;
};

export const CredentialsEmpty = () => {
  return (
    <EmptyView
      message="You haven't created any credentials yet. Get started by adding your first API key"
      onNew={() => {}}
    />
  );
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  return (
    <EntityItem
      href={`/credenetials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          {data.type} &bull; Updated{" "}
          {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <KeyIcon className="size-5 text-muted-foreground" />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
