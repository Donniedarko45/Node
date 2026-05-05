"use client";

import React, { useState } from "react";
import { WORKFLOW_TEMPLATES, type WorkflowTemplate } from "../workflow-templates";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  SparklesIcon, 
  ZapIcon, 
  BellIcon, 
  DatabaseIcon,
  ClockIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  CopyIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useRouter } from "next/navigation";

const categoryIcons = {
  ai: SparklesIcon,
  automation: ZapIcon,
  notifications: BellIcon,
  data: DatabaseIcon,
};

const difficultyColors = {
  beginner: "bg-green-500",
  intermediate: "bg-yellow-500",
  advanced: "bg-red-500",
};

export function TemplateGallery() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const createWorkflow = useCreateWorkflow();
  const router = useRouter();

  const filteredTemplates = selectedCategory === "all"
    ? WORKFLOW_TEMPLATES
    : WORKFLOW_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      const workflow = await createWorkflow.mutateAsync({
        name: template.name,
      });

      // TODO: Add nodes and connections to the workflow
      // This would require additional API endpoints

      toast.success(`Template "${template.name}" created!`);
      router.push(`/workflows/${workflow.id}`);
    } catch (error: any) {
      toast.error(`Failed to create workflow: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workflow Templates</h1>
        <p className="text-muted-foreground">
          Start with pre-built workflows and customize them to your needs
        </p>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="ai">
            <SparklesIcon className="size-4 mr-2" />
            AI
          </TabsTrigger>
          <TabsTrigger value="automation">
            <ZapIcon className="size-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellIcon className="size-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data">
            <DatabaseIcon className="size-4 mr-2" />
            Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => setSelectedTemplate(template)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Detail Dialog */}
      {selectedTemplate && (
        <TemplateDetailDialog
          template={selectedTemplate}
          open={!!selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUse={handleUseTemplate}
          isCreating={createWorkflow.isPending}
        />
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: WorkflowTemplate;
  onSelect: () => void;
}) {
  const CategoryIcon = categoryIcons[template.category];

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{template.icon}</div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {template.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <CategoryIcon className="size-3 mr-1" />
                  {template.category}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${difficultyColors[template.difficulty]}`}
                >
                  {template.difficulty}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ClockIcon className="size-4" />
            {template.estimatedTime}
          </div>
          <div className="flex items-center gap-1">
            <ZapIcon className="size-4" />
            {template.nodes.length} nodes
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full group-hover:bg-primary" variant="outline">
          View Details
          <ArrowRightIcon className="size-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function TemplateDetailDialog({
  template,
  open,
  onClose,
  onUse,
  isCreating,
}: {
  template: WorkflowTemplate;
  open: boolean;
  onClose: () => void;
  onUse: (template: WorkflowTemplate) => void;
  isCreating: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="text-5xl">{template.icon}</div>
            <div>
              <DialogTitle className="text-2xl">{template.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {template.category}
            </Badge>
            <Badge variant="secondary" className={difficultyColors[template.difficulty]}>
              {template.difficulty}
            </Badge>
            <Badge variant="outline">
              <ClockIcon className="size-3 mr-1" />
              {template.estimatedTime}
            </Badge>
            <Badge variant="outline">
              <ZapIcon className="size-3 mr-1" />
              {template.nodes.length} nodes
            </Badge>
          </div>

          {/* Workflow Preview */}
          <div>
            <h3 className="font-semibold mb-3">Workflow Steps</h3>
            <div className="space-y-2">
              {template.nodes.map((node, index) => (
                <div key={node.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{node.name}</p>
                    <p className="text-sm text-muted-foreground">{node.type}</p>
                  </div>
                  <CheckCircle2Icon className="size-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Required Credentials */}
          <div>
            <h3 className="font-semibold mb-3">Required Credentials</h3>
            <div className="flex flex-wrap gap-2">
              {template.requiredCredentials.map((cred) => (
                <Badge key={cred} variant="outline">
                  {cred}
                </Badge>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="font-semibold mb-3">Use Cases</h3>
            <ul className="space-y-2">
              {template.useCases.map((useCase, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2Icon className="size-5 text-green-500 mt-0.5" />
                  <span className="text-sm">{useCase}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={() => onUse(template)}
            disabled={isCreating}
          >
            <CopyIcon className="size-4 mr-2" />
            {isCreating ? "Creating..." : "Use This Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
