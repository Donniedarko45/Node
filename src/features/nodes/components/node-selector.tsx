"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon } from "lucide-react";
import { TRIGGER_NODES, EXECUTOR_NODES } from "../node-configs";
import { NodeConfig } from "../types";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NodeSelectorProps {
  onSelectNode: (nodeConfig: NodeConfig) => void;
}

export const NodeSelector = ({ onSelectNode }: NodeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filterNodes = (nodes: NodeConfig[]) => {
    if (!search) return nodes;
    return nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(search.toLowerCase()) ||
        node.description.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleSelectNode = (config: NodeConfig) => {
    onSelectNode(config);
    setOpen(false);
    setSearch("");
  };

  const filteredTriggers = filterNodes(TRIGGER_NODES);
  const filteredExecutors = filterNodes(EXECUTOR_NODES);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-2">
          <PlusIcon className="size-4" />
          Add Node
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Add Node</SheetTitle>
          <SheetDescription>
            Choose a trigger or action to add to your workflow
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="executors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="triggers">
                Triggers ({filteredTriggers.length})
              </TabsTrigger>
              <TabsTrigger value="executors">
                Actions ({filteredExecutors.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="triggers" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {filteredTriggers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No triggers found
                    </p>
                  ) : (
                    filteredTriggers.map((config) => (
                      <NodeCard
                        key={config.type}
                        config={config}
                        onClick={() => handleSelectNode(config)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="executors" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-2">
                  {filteredExecutors.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No actions found
                    </p>
                  ) : (
                    filteredExecutors.map((config) => (
                      <NodeCard
                        key={config.type}
                        config={config}
                        onClick={() => handleSelectNode(config)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface NodeCardProps {
  config: NodeConfig;
  onClick: () => void;
}

const NodeCard = ({ config, onClick }: NodeCardProps) => {
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg border-2 border-border",
        "hover:border-primary hover:bg-accent transition-all text-left",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center size-10 rounded-md shrink-0",
          config.color,
          "text-white"
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{config.label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {config.description}
        </div>
        {config.requiresCredential && (
          <div className="text-xs text-orange-600 mt-1">
            Requires API Key
          </div>
        )}
      </div>
    </button>
  );
};
