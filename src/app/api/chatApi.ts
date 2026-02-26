const DEFAULT_BASE_URL = "http://localhost:8019/query_sse";

export interface QuerySseParams {
  user_id: string;
  question: string;

  thread_id: string;

  memory_key?: string;
}

export interface QuerySseMetadata {
  chart_type?: string;
  suggestions?: string[];
}
export interface ThreadInfo {
  thread_id: string;
  memory_key?: string;
}

export interface QuerySseCallbacks {
  onChunk?: (text: string) => void;

  onComplete?: (fullText: string, metadata?: QuerySseMetadata) => void;

  onThreadId?: (info: ThreadInfo) => void;
  onRoute?: (route: string, node: string) => void;

  onStatus?: (key: string, value: number, node: string) => void;

  onError?: (error: Error) => void;
}

function getBaseUrl(): string {
  const meta = import.meta as { env?: { VITE_CHAT_API_URL?: string } };
  if (meta.env?.VITE_CHAT_API_URL) {
    return meta.env.VITE_CHAT_API_URL;
  }
  return DEFAULT_BASE_URL;
}

function parseJsonLine(line: string): Record<string, unknown> | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (payload === "" || payload === "[DONE]") return null;
  try {
    const parsed = JSON.parse(payload);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function querySse(
  params: QuerySseParams,
  callbacks: QuerySseCallbacks,
): Promise<void> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl.replace(/\/$/, "")}/query_sse`;

  const { onChunk, onComplete, onThreadId, onRoute, onStatus, onError } =
    callbacks;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(
        `query_sse failed: ${response.status} ${response.statusText}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let currentEvent: string | null = null;
    let lastAnswer = "";
    let metadata: QuerySseMetadata | undefined;

    const processLine = (line: string) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("event:")) {
        currentEvent = trimmed.slice(6).trim();
        return;
      }
      if (trimmed.startsWith("data:")) {
        const data = parseJsonLine(line);
        if (!data) return;

        switch (currentEvent) {
          case "thread_id": {
            const thread_id =
              typeof data.thread_id === "string" ? data.thread_id : undefined;
            const memory_key =
              typeof data.memory_key === "string" ? data.memory_key : undefined;
            if (thread_id) onThreadId?.({ thread_id, memory_key });
            break;
          }
          case "route": {
            const route = typeof data.route === "string" ? data.route : "";
            const node = typeof data.node === "string" ? data.node : "";
            onRoute?.(route, node);
            break;
          }
          case "answer": {
            const answer = typeof data.answer === "string" ? data.answer : "";
            if (answer) {
              lastAnswer = answer;
              onChunk?.(answer);
            }
            if (data.chart_type != null || data.suggestions != null) {
              if (typeof data.chart_type === "string")
                metadata = { ...metadata, chart_type: data.chart_type };
              if (Array.isArray(data.suggestions))
                metadata = {
                  ...metadata,
                  suggestions: data.suggestions.filter(
                    (s): s is string => typeof s === "string",
                  ),
                };
            }
            break;
          }
          case "status": {
            const key = typeof data.key === "string" ? data.key : "";
            const value = typeof data.value === "number" ? data.value : 0;
            const node = typeof data.node === "string" ? data.node : "";
            onStatus?.(key, value, node);
            break;
          }
          default:
            break;
        }
        currentEvent = null;
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        processLine(line);
      }
    }
    if (buffer.trim()) {
      processLine(buffer);
    }

    onComplete?.(lastAnswer, metadata);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    onError?.(error);
    throw error;
  }
}
