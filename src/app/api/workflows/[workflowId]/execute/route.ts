import { NextRequest, NextResponse } from "next/server";
import { executeWorkflow, ExecutionError } from "@/lib/execution-engine";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { workflowId } = await params;
    const body = await request.json().catch(() => ({}));
    const triggerData = body.triggerData || {};
    const timeout = body.timeout || 300000; // 5 minutes default
    const retryAttempts = body.retryAttempts || 3;

    // Execute workflow using production-ready engine
    const result = await executeWorkflow({
      workflowId,
      userId: session.user.id,
      triggerData,
      timeout,
      retryAttempts,
    });

    if (result.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        executionId: result.executionId,
        output: result.output,
        nodeResults: result.nodeResults,
        duration: result.totalDuration,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          executionId: result.executionId,
          nodeResults: result.nodeResults,
          duration: result.totalDuration,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Workflow execution error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof ExecutionError 
          ? error.message 
          : "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
