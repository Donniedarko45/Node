"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Nodetype } from "@/generated/prisma/enums";
import { getNodeConfig } from "../node-configs";
import { Slider } from "@/components/ui/slider";

interface NodeSettingsProps {
  nodeId: string | null;
  nodeType: Nodetype | null;
  nodeData: Record<string, any>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (nodeId: string, data: Record<string, any>) => void;
}

export const NodeSettings = ({
  nodeId,
  nodeType,
  nodeData,
  open,
  onOpenChange,
  onSave,
}: NodeSettingsProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (nodeData) {
      setFormData(nodeData);
    }
  }, [nodeData]);

  if (!nodeId || !nodeType) return null;

  const config = getNodeConfig(nodeType);

  const handleSave = () => {
    onSave(nodeId, formData);
    onOpenChange(false);
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configure {config.label}</SheetTitle>
          <SheetDescription>{config.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Common: Node Name */}
          <div className="space-y-2">
            <Label htmlFor="label">Node Name</Label>
            <Input
              id="label"
              value={formData.label || ""}
              onChange={(e) => updateField("label", e.target.value)}
              placeholder="Enter node name"
            />
          </div>

          {/* HTTP Request Settings */}
          {nodeType === Nodetype.HTTP_REQUEST && (
            <HttpRequestSettings formData={formData} updateField={updateField} />
          )}

          {/* AI Model Settings */}
          {(nodeType === Nodetype.OPENAI ||
            nodeType === Nodetype.ANTHROPIC ||
            nodeType === Nodetype.GEMINI) && (
            <AIModelSettings
              nodeType={nodeType}
              formData={formData}
              updateField={updateField}
            />
          )}

          {/* Discord/Slack Settings */}
          {(nodeType === Nodetype.DISCORD || nodeType === Nodetype.SLACK) && (
            <WebhookSettings formData={formData} updateField={updateField} />
          )}

          {/* Manual Trigger Settings */}
          {nodeType === Nodetype.MANUAL_TRIGGER && (
            <div className="text-sm text-muted-foreground">
              This node will be triggered manually from the editor.
            </div>
          )}

          {/* Webhook Trigger Settings */}
          {(nodeType === Nodetype.GOOGLE_FORM_TRIGGER ||
            nodeType === Nodetype.STRIPE_TRIGGER) && (
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                value={`${window.location.origin}/api/webhooks/${nodeType.toLowerCase()}`}
                readOnly
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Use this URL in your {config.label} configuration
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// HTTP Request specific settings
const HttpRequestSettings = ({
  formData,
  updateField,
}: {
  formData: Record<string, any>;
  updateField: (key: string, value: any) => void;
}) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="method">Method</Label>
      <Select
        value={formData.method || "GET"}
        onValueChange={(value) => updateField("method", value)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
          <SelectItem value="PUT">PUT</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
          <SelectItem value="PATCH">PATCH</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="url">URL</Label>
      <Input
        id="url"
        value={formData.url || ""}
        onChange={(e) => updateField("url", e.target.value)}
        placeholder="https://api.example.com/endpoint"
      />
      <p className="text-xs text-muted-foreground">
        Use {`{{ variableName }}`} for dynamic values
      </p>
    </div>

    <div className="space-y-2">
      <Label htmlFor="headers">Headers (JSON)</Label>
      <Textarea
        id="headers"
        value={
          typeof formData.headers === "string"
            ? formData.headers
            : JSON.stringify(formData.headers || {}, null, 2)
        }
        onChange={(e) => updateField("headers", e.target.value)}
        placeholder='{"Content-Type": "application/json"}'
        rows={4}
        className="font-mono text-xs"
      />
    </div>

    {(formData.method === "POST" ||
      formData.method === "PUT" ||
      formData.method === "PATCH") && (
      <div className="space-y-2">
        <Label htmlFor="body">Body</Label>
        <Textarea
          id="body"
          value={formData.body || ""}
          onChange={(e) => updateField("body", e.target.value)}
          placeholder='{"key": "{{ value }}"}'
          rows={6}
          className="font-mono text-xs"
        />
      </div>
    )}
  </>
);

// AI Model specific settings
const AIModelSettings = ({
  nodeType,
  formData,
  updateField,
}: {
  nodeType: Nodetype;
  formData: Record<string, any>;
  updateField: (key: string, value: any) => void;
}) => {
  const getModelOptions = () => {
    switch (nodeType) {
      case Nodetype.OPENAI:
        return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"];
      case Nodetype.ANTHROPIC:
        return [
          "claude-3-5-sonnet-20241022",
          "claude-3-5-haiku-20241022",
          "claude-3-opus-20240229",
        ];
      case Nodetype.GEMINI:
        return ["gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Select
          value={formData.model || getModelOptions()[0]}
          onValueChange={(value) => updateField("model", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getModelOptions().map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          value={formData.systemPrompt || ""}
          onChange={(e) => updateField("systemPrompt", e.target.value)}
          placeholder="You are a helpful assistant..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userPrompt">User Prompt</Label>
        <Textarea
          id="userPrompt"
          value={formData.userPrompt || ""}
          onChange={(e) => updateField("userPrompt", e.target.value)}
          placeholder="Analyze this data: {{ previousNode.output }}"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Use {`{{ variableName }}`} to reference previous node outputs
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">
          Temperature: {formData.temperature || 0.7}
        </Label>
        <Slider
          id="temperature"
          min={0}
          max={2}
          step={0.1}
          value={[formData.temperature || 0.7]}
          onValueChange={(value) => updateField("temperature", value[0])}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          value={formData.maxTokens || 1000}
          onChange={(e) => updateField("maxTokens", parseInt(e.target.value))}
          min={1}
          max={4000}
        />
      </div>
    </>
  );
};

// Webhook (Discord/Slack) settings
const WebhookSettings = ({
  formData,
  updateField,
}: {
  formData: Record<string, any>;
  updateField: (key: string, value: any) => void;
}) => (
  <>
    <div className="space-y-2">
      <Label htmlFor="webhookUrl">Webhook URL</Label>
      <Input
        id="webhookUrl"
        value={formData.webhookUrl || ""}
        onChange={(e) => updateField("webhookUrl", e.target.value)}
        placeholder="https://discord.com/api/webhooks/..."
        type="url"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea
        id="message"
        value={formData.message || ""}
        onChange={(e) => updateField("message", e.target.value)}
        placeholder="New submission: {{ formData.name }}"
        rows={6}
      />
      <p className="text-xs text-muted-foreground">
        Use {`{{ variableName }}`} for dynamic content
      </p>
    </div>
  </>
);
