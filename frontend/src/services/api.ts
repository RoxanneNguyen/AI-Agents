/**
 * API service for communicating with the backend
 */

import type { ChatResponse, SessionInfo, Artifact } from "../types";

const API_BASE = "/api";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ detail: "Unknown error" }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Send a chat message to the agent
   */
  async sendMessage(
    content: string,
    sessionId?: string,
    context?: Record<string, unknown>
  ): Promise<ChatResponse> {
    return this.request<ChatResponse>("/chat", {
      method: "POST",
      body: JSON.stringify({
        content,
        session_id: sessionId,
        context,
      }),
    });
  }

  /**
   * Get all sessions
   */
  async getSessions(): Promise<SessionInfo[]> {
    return this.request<SessionInfo[]>("/sessions");
  }

  /**
   * Get a specific session
   */
  async getSession(sessionId: string): Promise<{
    id: string;
    messages: Array<{ role: string; content: string; timestamp: string }>;
    artifacts: Artifact[];
  }> {
    return this.request(`/sessions/${sessionId}`);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<{ status: string }> {
    return this.request(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  }

  /**
   * Get artifacts from a session
   */
  async getSessionArtifacts(sessionId: string): Promise<Artifact[]> {
    return this.request<Artifact[]>(`/sessions/${sessionId}/artifacts`);
  }

  /**
   * Get available tools
   */
  async getTools(): Promise<{
    agent_name: string;
    tools: Array<{
      name: string;
      functions: Array<{ name: string; description: string }>;
    }>;
  }> {
    return this.request("/tools");
  }

  /**
   * Perform a quick research query
   */
  async research(query: string): Promise<ChatResponse> {
    return this.request("/research", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  /**
   * Perform data analysis
   */
  async analyze(dataSource: string, request: string): Promise<ChatResponse> {
    return this.request("/analyze", {
      method: "POST",
      body: JSON.stringify({ data_source: dataSource, request }),
    });
  }

  /**
   * Create a document
   */
  async createDocument(
    docType: string,
    requirements: string
  ): Promise<ChatResponse> {
    return this.request("/document", {
      method: "POST",
      body: JSON.stringify({ doc_type: docType, requirements }),
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    model: string;
    tools_available: string[];
  }> {
    const response = await fetch("/health");
    return response.json();
  }
}

export const api = new ApiService();
