"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PlayIcon, SaveIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import {
  useSuspenseWorkflow,
  useUpdateWorkfowName,
} from "@/features/workflows/hooks/use-workflows";
import { useRunWorkflow } from "@/features/workflows/hooks/use-run-workflow";
import { toast } from "sonner";

export const EditorBreadCrumbs = ({ workflowId }: { workflowId: string }) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link prefetch href="/workflows">
              Workflows
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <EditorNameInput workflowId={workflowId} />
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const EditorRunButton = ({ workflowId }: { workflowId: string }) => {
  const runWorkflow = useRunWorkflow();

  const handleRun = async () => {
    try {
      const result = await runWorkflow.mutateAsync({ workflowId });
      
      // Optionally show node execution details
      if (result.nodeResults && result.nodeResults.length > 0) {
        console.log("Node execution results:", result.nodeResults);
      }
    } catch (error: any) {
      // Error is already handled in the hook with toast
      console.error("Workflow execution failed:", error);
    }
  };

  return (
    <Button
      onClick={handleRun}
      disabled={runWorkflow.isPending}
      variant="default"
      className="gap-2"
    >
      <PlayIcon className="size-4" />
      {runWorkflow.isPending ? "Running..." : "Run Workflow"}
    </Button>
  );
};

export const EditorSaveButton = ({ workflowId }: { workflowId: string }) => {
  return (
    <div className="ml-auto flex gap-2">
      <EditorRunButton workflowId={workflowId} />
      <Button onClick={() => {}} disabled={false} variant="outline">
        <SaveIcon className="size-4" />
        Save
      </Button>
    </div>
  );
};

export const EditorNameInput = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  const updateWorkflow = useUpdateWorkfowName();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(workflow.name);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workflow.name) {
      setName(workflow.name);
    }
  }, [workflow.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name == workflow.name) {
      setIsEditing(false);

      return;
    }

    setIsEditing(false);
    try {
      await updateWorkflow.mutateAsync({ id: workflowId, name });
    } catch {
      setName(workflow.name);
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setName(workflow.name);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        className="h-7 w-auto min-w-100 px-2"
      />
    );
  }

  return (
    <BreadcrumbItem
      onClick={() => {
        setIsEditing(true);
      }}
      className="cursor-pointer hover:text-foreground transition-colors"
    >
      {workflow.name}
    </BreadcrumbItem>
  );
};
export const EditorHeader = ({ workflowId }: { workflowId: string }) => {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />
      <div className="flex flex-row items-center justify-between gap-x-4 w-full">
        <EditorBreadCrumbs workflowId={workflowId} />
        <EditorSaveButton workflowId={workflowId} />
      </div>
    </header>
  );
};
