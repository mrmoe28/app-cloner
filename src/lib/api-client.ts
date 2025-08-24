import axios from 'axios';
import { ApiResponse, AnalysisResponse, AnalysisResult } from '@/types';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  private getApiUrl(endpoint: string): string {
    return `${this.baseURL}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  async analyzeProject(projectId: string, additionalContext?: string): Promise<AnalysisResult> {
    try {
      const response = await axios.post<AnalysisResponse>(
        this.getApiUrl('/analyze'),
        {
          projectId,
          additionalContext
        },
        {
          timeout: 120000, // 2 minutes for AI analysis
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Analysis failed');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Analysis failed: ${message}`);
      }
      throw error;
    }
  }

  async getAnalysis(projectId: string): Promise<AnalysisResult> {
    try {
      const response = await axios.get<AnalysisResponse>(
        this.getApiUrl(`/analyze?projectId=${projectId}`),
        {
          timeout: 30000,
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get analysis');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Failed to get analysis: ${message}`);
      }
      throw error;
    }
  }

  async uploadImage(file: File): Promise<{ imageId: string; preview: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        this.getApiUrl('/upload'),
        formData,
        {
          timeout: 60000,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              // You can emit progress events here if needed
              console.log(`Upload progress: ${progress}%`);
            }
          }
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Upload failed');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Upload failed: ${message}`);
      }
      throw error;
    }
  }

  async generateCode(projectId: string, options?: {
    platform?: string;
    framework?: string;
    includeBackend?: boolean;
    includeDatabase?: boolean;
  }): Promise<{ projectId: string; downloadUrl: string; previewUrl?: string }> {
    try {
      const response = await axios.post(
        this.getApiUrl('/generate'),
        {
          projectId,
          ...options
        },
        {
          timeout: 180000, // 3 minutes for code generation
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Code generation failed');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(`Code generation failed: ${message}`);
      }
      throw error;
    }
  }

  // Health check for API
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(
        this.getApiUrl('/health'),
        { timeout: 5000 }
      );
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();
export default apiClient;