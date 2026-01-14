/**
 * Type definitions for the AI Agents Platform
 */

// Message types
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  artifacts?: Artifact[];
  steps?: ExecutionStep[];
  isLoading?: boolean;
}

// Execution step types
export type StepType =
  | "thought"
  | "action"
  | "observation"
  | "final_answer"
  | "error";

export interface ExecutionStep {
  id: string;
  type: StepType;
  content: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: string;
  timestamp: string;
  duration_ms?: number;
}

// Artifact types
export type ArtifactType =
  | "code"
  | "document"
  | "chart"
  | "table"
  | "html"
  | "image"
  | "text";

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: string;
  language?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// API response types
export interface ChatResponse {
  session_id: string;
  message: string;
  success: boolean;
  artifacts: Artifact[];
  steps: ExecutionStep[];
  duration_ms: number;
}

export interface SessionInfo {
  session_id: string;
  created_at: string;
  message_count: number;
  last_activity: string;
}

// WebSocket message types
export interface WSMessage {
  type:
    | "start"
    | "step"
    | "token"
    | "artifact"
    | "complete"
    | "error"
    | "connected"
    | "pong";
  data?: unknown;
  session_id?: string;
  message?: string;
}

// Tool types
export interface Tool {
  name: string;
  description: string;
  functions: ToolFunction[];
}

export interface ToolFunction {
  name: string;
  description: string;
}

// Chart data types
export interface ChartData {
  type: "bar" | "line" | "scatter" | "pie" | "histogram" | "box";
  data: unknown;
  layout: unknown;
}

// Store types
export interface ChatStore {
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  currentArtifacts: Artifact[];
  selectedArtifact: Artifact | null;
  setSessionId: (id: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setLoading: (loading: boolean) => void;
  addArtifact: (artifact: Artifact) => void;
  setSelectedArtifact: (artifact: Artifact | null) => void;
  clearChat: () => void;
}
