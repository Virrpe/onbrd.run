/**
 * AI Client - Interface for AI-powered features
 * Provides AI functionality with built-in privacy controls
 */

import { assertAIEnabled, AIDisabledError } from './gate';

/**
 * AI Analysis Request
 */
export interface AIAnalysisRequest {
  content: string;
  context?: {
    url?: string;
    title?: string;
    metadata?: Record<string, any>;
  };
}

/**
 * AI Analysis Response
 */
export interface AIAnalysisResponse {
  insights: string[];
  recommendations: string[];
  confidence: number;
}

/**
 * AI Client for performing AI-powered analysis
 * All methods require AI to be enabled via user opt-in
 */
export class AIClient {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '') {
    this.apiEndpoint = apiEndpoint;
  }

  /**
   * Analyze page content using AI
   * @param request - The analysis request containing page content
   * @returns Promise with AI analysis results
   * @throws AIDisabledError if AI features are not enabled
   */
  async analyzeContent(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Ensure AI is enabled before making any AI calls
    assertAIEnabled();

    if (!this.apiEndpoint) {
      throw new Error('AI API endpoint not configured');
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/api/v1/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`AI analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.validateAIResponse(result);
    } catch (error) {
      if (error instanceof AIDisabledError) {
        throw error;
      }
      throw new Error(`AI analysis request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate insights for onboarding optimization
   * @param content - Page content to analyze
   * @param context - Additional context about the page
   * @returns Promise with generated insights
   * @throws AIDisabledError if AI features are not enabled
   */
  async generateInsights(content: string, context?: AIAnalysisRequest['context']): Promise<string[]> {
    assertAIEnabled();

    const request: AIAnalysisRequest = { content, context };
    const response = await this.analyzeContent(request);
    return response.insights;
  }

  /**
   * Validate AI response structure
   */
  private validateAIResponse(data: any): AIAnalysisResponse {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid AI response format');
    }

    const { insights, recommendations, confidence } = data;

    if (!Array.isArray(insights) || !Array.isArray(recommendations)) {
      throw new Error('AI response missing required fields');
    }

    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
      throw new Error('AI response has invalid confidence score');
    }

    return {
      insights: insights.filter((i: any) => typeof i === 'string'),
      recommendations: recommendations.filter((r: any) => typeof r === 'string'),
      confidence,
    };
  }
}

/**
 * Convenience function to create an AI client instance
 */
export function createAIClient(apiEndpoint?: string): AIClient {
  return new AIClient(apiEndpoint);
}