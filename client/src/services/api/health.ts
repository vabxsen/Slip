import { SERVER_URL } from '@/utils/env';

export interface HealthResponse {
  status: 'ok';
  uptime: number;
}

/** Pings the signaling server; used to surface connectivity in the UI. */
export async function fetchServerHealth(): Promise<HealthResponse> {
  const response = await fetch(`${SERVER_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return (await response.json()) as HealthResponse;
}
