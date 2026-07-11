export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  constituency: string;
}

export interface Suggestion {
  _id: string;
  citizenId: string | { _id: string; name: string; email: string };
  title: string;
  description: string;
  category: "infrastructure" | "policy" | "community" | "other";
  constituency: string;
  phoneNumber: string;
  village: string;
  status: "submitted" | "under_review" | "implemented" | "rejected";
  priorityScore: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSuggestionPayload {
  citizenId: string;
  title: string;
  description: string;
  category: "infrastructure" | "policy" | "community" | "other";
  constituency: string;
  phoneNumber: string;
  village: string;
}

export interface DashboardStats {
  overview: {
    total: number;
    pending: number;
    completed: number;
    rejected: number;
  };
  categories: Array<{
    name: string;
    count: number;
  }>;
  highPrioritySuggestions: Suggestion[];
  latestSuggestions: Suggestion[];
}

export interface AISuggestionAnalysis {
  category: "infrastructure" | "policy" | "community" | "other";
  priority: number;
  summary: string;
  confidence: number;
}

export interface AISentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  priorityScore: number;
  extractedNeeds: string[];
}

export interface AIPriorityRecommendation {
  priorities: string; // The markdown response from suggestPriorities
}

export interface Decision {
  _id: string;
  suggestionId?: { _id: string; title: string; category: string; village: string; description: string };
  constituency: string;
  village?: string;
  action: "Dispatch Volunteers" | "Open Gates" | "Close Gates" | "Broadcast Messages" | "Medical Escalation" | "Transport Diversion" | "Parking Redirection";
  decision: string;
  reason: string;
  expectedImpact: string;
  responsibleTeam: string;
  eta: string;
  status: "pending" | "executed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = typeof window === "undefined"
  ? ((process.env.BACKEND_URL || "http://localhost:5000") + "/api/v1")
  : "/api/v1";

/**
 * Base fetch wrapper with error handling and default token attachment
 */
async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  if (!headers.has("Authorization")) {
    headers.set("Authorization", "Bearer demo-token");
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json.data !== undefined ? json.data : json;
}

/**
 * Centralized API Client methods
 */
export const api = {
  // ── Suggestions ───────────────────────────────────────
  suggestions: {
    list: (params: { constituency?: string; status?: string; page?: number; limit?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.constituency) query.set("constituency", params.constituency);
      if (params.status) query.set("status", params.status);
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
      
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return fetcher<{ data: Suggestion[]; meta: { total: number; page: number; pages: number } }>(
        `/suggestions${queryString}`
      );
    },
    
    getById: (id: string) => {
      return fetcher<Suggestion>(`/suggestions/${id}`);
    },
    
    create: (payload: CreateSuggestionPayload) => {
      return fetcher<Suggestion>("/suggestions", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    
    updateStatus: (id: string, status: Suggestion["status"]) => {
      return fetcher<Suggestion>(`/suggestions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
  },

  // ── Representatives ──────────────────────────────────
  representatives: {
    list: (params: { constituency?: string; page?: number; limit?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.constituency) query.set("constituency", params.constituency);
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
      
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return fetcher<{ data: User[]; meta: { total: number; page: number; pages: number } }>(
        `/representatives${queryString}`
      );
    },

    create: (payload: Partial<User> & { name: string; email: string; constituency: string }) => {
      return fetcher<User>("/representatives", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  // ── Dashboard ─────────────────────────────────────────
  dashboard: {
    getSuggestions: (params: { constituency?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.constituency) query.set("constituency", params.constituency);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return fetcher<DashboardStats>(`/dashboard/suggestions${queryString}`);
    },
  },

  // ── Gemini AI ─────────────────────────────────────────
  ai: {
    analyzeSuggestion: (suggestionText: string, customPrompt?: string) => {
      return fetcher<AISuggestionAnalysis>("/ai/analyze-suggestion", {
        method: "POST",
        body: JSON.stringify({ suggestionText, customPrompt }),
      });
    },

    suggestPriorities: (params: { constituency?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.constituency) query.set("constituency", params.constituency);
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return fetcher<{ priorities: string }>(`/ai/suggest-priorities${queryString}`);
    },

    analyzeSentiment: (text: string) => {
      return fetcher<AISentimentResult>("/ai/analyze-sentiment", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
    },

    summarise: (issues: string[]) => {
      return fetcher<{ summary: string }>("/ai/summarise", {
        method: "POST",
        body: JSON.stringify({ issues }),
      });
    },

    agentChatStream: async (
      payload: { query: string; constituency: string; agentType?: string; taskType?: string },
      onChunk: (data: { text: string; agentType: string; contextSuggestions: any[]; isFallback?: boolean }) => void,
      onDone?: () => void,
      onError?: (err: Error) => void
    ) => {
      try {
        const response = await fetch(`${API_BASE_URL}/agents/agent-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer demo-token"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Failed to establish chat stream: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) {
          throw new Error("ReadableStream is not supported or body is null.");
        }

        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              const dataContent = trimmedLine.replace("data: ", "").trim();
              if (dataContent === "[DONE]") {
                if (onDone) onDone();
                return;
              }
              try {
                const parsed = JSON.parse(dataContent);
                onChunk(parsed);
              } catch (parseErr) {
                console.warn("Failed to parse stream JSON:", parseErr);
              }
            }
          }
        }
        if (onDone) onDone();
      } catch (err: any) {
        if (onError) onError(err);
        else console.error("Stream reading error:", err);
      }
    },
  },

  // ── File Upload ───────────────────────────────────────
  upload: {
    image: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return fetcher<{ url: string; filename: string; size: number }>("/upload/image", {
        method: "POST",
        body: formData,
      });
    },
  },

  // ── Decision Engine ──────────────────────────────────
  decisions: {
    list: (params: { constituency?: string; status?: string } = {}) => {
      const query = new URLSearchParams();
      if (params.constituency) query.set("constituency", params.constituency);
      if (params.status) query.set("status", params.status);
      
      const queryString = query.toString() ? `?${query.toString()}` : "";
      return fetcher<Decision[]>(`/decisions${queryString}`);
    },

    updateStatus: (id: string, status: Decision["status"]) => {
      return fetcher<Decision>(`/decisions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },

    evaluate: (suggestionId: string) => {
      return fetcher<Decision[]>(`/decisions/evaluate/${suggestionId}`, {
        method: "POST",
      });
    },
  },
};
