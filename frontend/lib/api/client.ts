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
};
