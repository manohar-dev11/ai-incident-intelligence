
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Analytics {
  total_incidents: number;
  open_incidents: number;
  investigating_incidents: number;
  resolved_incidents: number;
  critical_incidents: number;
  high_incidents: number;
  medium_incidents: number;
  low_incidents: number;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved";
  source: string;
  created_at: string;
}

export interface LogUploadResponse {
  filename: string;
  total_lines: number;
  detected_count: number;
  created_count: number;
  duplicate_count: number;
  created_incidents: Incident[];
}

export interface IncidentFilters {
  severity?: string;
  status?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

export const getAnalytics = async () => {
  const response = await api.get<Analytics>("/analytics/summary");
  return response.data;
};

export const getIncidents = async (
  filters: IncidentFilters = {}
) => {
  const response = await api.get<Incident[]>("/incidents/", {
    params: {
      skip: filters.skip ?? 0,
      limit: filters.limit ?? 10,
      severity: filters.severity || undefined,
      status: filters.status || undefined,
      search: filters.search || undefined,
    },
  });

  return response.data;
};

export const updateIncident = async (
  id: number,
  data: Partial<Pick<Incident, "status" | "severity" | "title" | "description">>
) => {
  const response = await api.put<Incident>(`/incidents/${id}`, data);
  return response.data;
};

export const uploadLogfile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<LogUploadResponse>(
    "/logs/upload",
    formData,
    {
      headers: {
        "Content-type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export default api;
