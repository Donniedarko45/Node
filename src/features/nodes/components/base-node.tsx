import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { getNodeConfig } from "../node-configs";
import { Nodetype } from "@/generated/prisma/enums";
import {
  CheckCircle2Icon,
  XCircleIcon,
  LoaderIcon,
  SettingsIcon,
  TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type NodeStatus = "idle" | "running" | "success" | "error";

export interface BaseNodeData {
  label: string;
  status?: NodeStatus;
  onDelete?: (nodeId: string) => void;
  onSettings?: (nodeId: string) => void;
  [key: string]: any;
}

interface BaseNodeProps extends NodeProps {
  data: BaseNodeData;
  nodeType: Nodetype;
}

const StatusIndicator = ({ status }: { status?: NodeStatus }) => {
  switch (status) {
    case "running":
      return <LoaderIcon className="size-4 text-blue-500 animate-spin" />;
    case "success":
      return <CheckCircle2Icon className="size-4 text-green-500" />;
    case "error":
      return <XCircleIcon className="size-4 text-red-500" />;
    default:
      return null;
  }
};

export const BaseNode = ({
  id,
  data,
  nodeType,
  selected,
}: BaseNodeProps) => {
  const { deleteElements } = useReactFlow();
  const config = getNodeConfig(nodeType);
  const Icon = config.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeType !== Nodetype.INITIAL) {
      deleteElements({ nodes: [{ id }] });
    }
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Settings will be handled by parent component via custom event
    window.dispatchEvent(
      new CustomEvent("openNodeSettings", { detail: { nodeId: id } })
    );
  };

  const isTrigger = config.category === "trigger";

  return (
    <div
      className={cn(
        "relative bg-white rounded-lg border-2 shadow-sm transition-all min-w-[200px]",
        selected ? "border-primary shadow-lg" : "border-border",
        data.status === "error" && "border-red-500"
      )}
    >
      {/* Input Handle (not for triggers) */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-primary !w-3 !h-3 !border-2 !border-white"
        />
      )}

      {/* Node Header */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-t-md",
          config.color,
          "text-white"
        )}
      >
        <Icon className="size-4" />
        <span className="font-medium text-sm flex-1">{config.label}</span>

        {/* Status Indicator */}
        {data.status && (
          <div className="bg-white rounded-full p-1">
            <StatusIndicator status={data.status} />
          </div>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-white hover:bg-white/20"
            >
              <SettingsIcon className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleSettings}>
              <SettingsIcon className="size-4 mr-2" />
              Settings
            </DropdownMenuItem>
            {nodeType !== Nodetype.INITIAL && (
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <TrashIcon className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Node Body */}
      <div className="px-3 py-2 space-y-1">
        <div className="text-sm font-medium text-foreground">{data.label}</div>
        {config.requiresCredential && (
          <Badge variant="outline" className="text-xs">
            Requires API Key
          </Badge>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
};
