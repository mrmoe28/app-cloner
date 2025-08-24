import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { VisionAnalyzer } from '@/lib/ai/vision-analyzer';
import { ApiResponse, AnalysisResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { projectId, additionalContext } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Get project and verify ownership
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { uploadedImage: true }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' } as ApiResponse,
        { status: 404 }
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' } as ApiResponse,
        { status: 403 }
      );
    }

    if (!project.uploadedImage) {
      return NextResponse.json(
        { success: false, error: 'No image found for this project' } as ApiResponse,
        { status: 400 }
      );
    }

    // Update project status to analyzing
    await db.project.update({
      where: { id: projectId },
      data: { status: 'ANALYZING' }
    });

    try {
      // Get base64 image data from preview
      const base64Data = project.uploadedImage.preview?.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid image data format');
      }

      // Analyze the image
      const analyzer = VisionAnalyzer.getInstance();
      const analysis = await analyzer.analyzeScreenshot({
        imageBase64: base64Data,
        projectId,
        userId: session.user.id,
        additionalContext
      });

      // Save analysis to database
      const savedAnalysis = await db.analysis.create({
        data: {
          id: analysis.id,
          projectId,
          platformDetection: JSON.stringify(analysis.platformDetection),
          components: JSON.stringify(analysis.components),
          layoutStructure: JSON.stringify(analysis.layout),
          designTokens: JSON.stringify(analysis.designTokens),
          confidence: analysis.confidence,
          processingTime: analysis.processingTime,
          reasoning: analysis.platformDetection.reasoning,
        }
      });

      // Update project status to analyzed
      await db.project.update({
        where: { id: projectId },
        data: { status: 'ANALYZED' }
      });

      // Return the analysis result
      return NextResponse.json({
        success: true,
        data: analysis
      } as AnalysisResponse);

    } catch (analysisError) {
      // Update project status to failed
      await db.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' }
      });

      throw analysisError;
    }

  } catch (error) {
    console.error('Analysis API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        message: 'Failed to analyze screenshot'
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as ApiResponse,
        { status: 401 }
      );
    }

    // Get project ID from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' } as ApiResponse,
        { status: 400 }
      );
    }

    // Get existing analysis
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { analysis: true }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' } as ApiResponse,
        { status: 404 }
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' } as ApiResponse,
        { status: 403 }
      );
    }

    if (!project.analysis) {
      return NextResponse.json(
        { success: false, error: 'No analysis found for this project' } as ApiResponse,
        { status: 404 }
      );
    }

    // Convert database analysis back to AnalysisResult format
    const analysis = {
      id: project.analysis.id,
      imageId: projectId,
      components: JSON.parse(project.analysis.components),
      layout: JSON.parse(project.analysis.layoutStructure),
      platformDetection: JSON.parse(project.analysis.platformDetection),
      designTokens: JSON.parse(project.analysis.designTokens),
      confidence: project.analysis.confidence,
      processingTime: project.analysis.processingTime,
      createdAt: project.analysis.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: analysis
    } as AnalysisResponse);

  } catch (error) {
    console.error('Get analysis API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      } as ApiResponse,
      { status: 500 }
    );
  }
}