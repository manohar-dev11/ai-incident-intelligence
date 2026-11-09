
import { useCallback, useEffect, useState } from "react";

import {
  Activity,
  LayoutDashboard,
  AlertTriangle,
  FileText,
  Upload,
  Settings,
  Search,
  Bell,
  Server,
  ShieldAlert,
  Clock3,
  RefreshCw,
  X,
  Eye,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  getAnalytics,
  getIncidents,
  updateIncident,
  uploadLogfile,
  type Analytics,
  type Incident,
  type LogUploadResponse,
} from "./services/api";

import "./App.css";

type Page = "dashboard" | "incidents" | "upload";

function App() {
  const [page, setPage] = useState<Page>("dashboard");

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Log upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] =
    useState<LogUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState("");

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [analyticsData, incidentData] = await Promise.all([
        getAnalytics(),
        getIncidents({ limit: 5 }),
      ]);

      setAnalytics(analyticsData);
      setIncidents(incidentData);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError("Unable to load dashboard data. Check your backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load and filter incidents
  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getIncidents({
        limit: 100,
        search: search || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
      });

      setIncidents(data);
    } catch (err) {
      console.error("Incident loading failed:", err);
      setError("Unable to load incidents. Check your backend server.");
    } finally {
      setLoading(false);
    }
  }, [search, severityFilter, statusFilter]);

  // Initial dashboard loading
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  // Reload incidents when filters change
  useEffect(() => {
    if (page !== "incidents") return;

    const timer = window.setTimeout(() => {
      void loadIncidents();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [page, loadIncidents]);

  // Update incident status or severity
  const handleUpdate = async (
    incident: Incident,
    field: "status" | "severity",
    value: string,
  ) => {
    try {
      setUpdatingId(incident.id);
      setError("");

      const updatedIncident = await updateIncident(incident.id, {
        [field]: value,
      });

      setSelectedIncident(updatedIncident);

      if (page === "incidents") {
        await loadIncidents();
      } else {
        await loadDashboard();
      }
    } catch (err) {
      console.error("Incident update failed:", err);
      setError("Unable to update incident. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Validate selected log file
  const handleFileSelection = (file?: File) => {
    if (!file) return;

    setUploadError("");
    setUploadResult(null);

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension !== "log" && extension !== "txt") {
      setSelectedFile(null);
      setUploadError("Only .log and .txt files are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setUploadError("File size must not exceed 5 MB.");
      return;
    }

    setSelectedFile(file);
  };

  // Upload log file
  const handleLogUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a log file first.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setUploadResult(null);

      const result = await uploadLogfile(selectedFile);

      setUploadResult(result);
      setSelectedFile(null);

      await loadDashboard();
    } catch (err) {
      console.error("Log upload failed:", err);
      setUploadError(
        "Upload failed. Please check the file and backend server.",
      );
    } finally {
      setUploading(false);
    }
  };

  // Dashboard statistics
  const stats = [
    {
      title: "Total Incidents",
      value: analytics?.total_incidents,
      description: "All recorded incidents",
      icon: Activity,
    },
    {
      title: "Open Incidents",
      value: analytics?.open_incidents,
      description: "Awaiting investigation",
      icon: AlertTriangle,
    },
    {
      title: "Critical Incidents",
      value: analytics?.critical_incidents,
      description: "Highest priority incidents",
      icon: ShieldAlert,
    },
    {
      title: "Resolved Incidents",
      value: analytics?.resolved_incidents,
      description: "Successfully resolved",
      icon: Server,
    },
  ];

  // Chart data
  const severityData = analytics
    ? [
        { name: "Critical", value: analytics.critical_incidents },
        { name: "High", value: analytics.high_incidents },
        { name: "Medium", value: analytics.medium_incidents },
        { name: "Low", value: analytics.low_incidents },
      ]
    : [];

  const chartColors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>

          <div>
            <h2>IncidentAI</h2>
            <span>Intelligence Platform</span>
          </div>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav className="navigation">
          <button
            className={`nav-item ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={`nav-item ${page === "incidents" ? "active" : ""}`}
            onClick={() => setPage("incidents")}
          >
            <AlertTriangle size={19} />
            Incidents
          </button>

          <button className="nav-item" disabled>
            <FileText size={19} />
            Log Explorer
          </button>

          <button
            className={`nav-item ${page === "upload" ? "active" : ""}`}
            onClick={() => setPage("upload")}
          >
            <Upload size={19} />
            Upload Logs
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item" disabled>
            <Settings size={19} />
            Settings
          </button>

          <div className="version">AI Incident Intelligence v1.0</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <h2>
              {page === "dashboard"
                ? "Dashboard Overview"
                : page === "incidents"
                  ? "Incident Management"
                  : "Upload Logs"}
            </h2>

            <p>Monitor and manage your application incidents.</p>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              onClick={() => {
                if (page === "dashboard") {
                  void loadDashboard();
                } else if (page === "incidents") {
                  void loadIncidents();
                }
              }}
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button className="icon-button" title="Notifications">
              <Bell size={19} />
            </button>

            <div className="avatar">AI</div>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Dashboard Page */}
        {page === "dashboard" ? (
          <>
            <section className="welcome-section">
              <div>
                <h1>Incident Dashboard</h1>
                <p>Here's what's happening with your systems.</p>
              </div>

              <div className="system-status">
                <span className="status-dot"></span>
                System Monitoring
              </div>
            </section>

            {/* Statistics */}
            <section className="stats-grid">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div className="stat-card" key={stat.title}>
                    <div className="stat-top">
                      <span>{stat.title}</span>
                      <Icon size={20} />
                    </div>

                    <h2>{loading ? "..." : (stat.value ?? 0)}</h2>

                    <p>{stat.description}</p>
                  </div>
                );
              })}
            </section>

            {/* Recent Incidents */}
            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Recent Incidents</h2>
                  <p>Latest incidents detected by the platform</p>
                </div>

                <button
                  className="view-button"
                  onClick={() => setPage("incidents")}
                >
                  View All
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>INCIDENT</th>
                      <th>SEVERITY</th>
                      <th>STATUS</th>
                      <th>SOURCE</th>
                      <th>CREATED</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          Loading incidents...
                        </td>
                      </tr>
                    ) : incidents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state">
                          No incidents found.
                        </td>
                      </tr>
                    ) : (
                      incidents.map((incident) => (
                        <tr key={incident.id}>
                          <td>
                            <strong>{incident.title}</strong>
                            <small className="incident-id">
                              ID: {incident.id}
                            </small>
                          </td>

                          <td>
                            <span className={`severity ${incident.severity}`}>
                              {incident.severity}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`incident-status ${incident.status}`}
                            >
                              {incident.status}
                            </span>
                          </td>

                          <td>{incident.source}</td>

                          <td>
                            {new Date(incident.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Severity Chart */}
            <section className="content-card chart-section">
              <div className="section-heading">
                <div>
                  <h2>Incident Severity Distribution</h2>
                  <p>Breakdown of incidents by severity</p>
                </div>
              </div>

              {loading ? (
                <p>Loading chart...</p>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={4}
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartColors[index]} />
                        ))}
                      </Pie>

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </>
        ) : page === "incidents" ? (
          /* Incident Management Page */
          <>
            <section className="welcome-section">
              <div>
                <h1>All Incidents</h1>
                <p>Search, filter, inspect and update detected incidents.</p>
              </div>

              <div className="system-status">
                <span className="status-dot"></span>
                Live Data
              </div>
            </section>

            <section className="content-card">
              <div className="incident-toolbar">
                <div className="search-box">
                  <Search size={18} />

                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <select
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                >
                  <option value="">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                </select>

                <button
                  className="view-button"
                  onClick={() => void loadIncidents()}
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>

              <div className="incident-results">
                <span>
                  {loading
                    ? "Loading..."
                    : `${incidents.length} incident(s) found`}
                </span>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>INCIDENT</th>
                      <th>SEVERITY</th>
                      <th>STATUS</th>
                      <th>SOURCE</th>
                      <th>CREATED</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          Loading incidents...
                        </td>
                      </tr>
                    ) : incidents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="empty-state">
                          <Clock3 size={25} />
                          <p>No incidents match your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      incidents.map((incident) => (
                        <tr key={incident.id}>
                          <td>
                            <strong>{incident.title}</strong>
                            <small className="incident-id">
                              ID: {incident.id}
                            </small>
                          </td>

                          <td>
                            <select
                              className={`inline-select severity-select ${incident.severity}`}
                              value={incident.severity}
                              disabled={updatingId === incident.id}
                              onChange={(event) =>
                                void handleUpdate(
                                  incident,
                                  "severity",
                                  event.target.value,
                                )
                              }
                            >
                              <option value="critical">Critical</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </td>

                          <td>
                            <select
                              className={`inline-select status-select ${incident.status}`}
                              value={incident.status}
                              disabled={updatingId === incident.id}
                              onChange={(event) =>
                                void handleUpdate(
                                  incident,
                                  "status",
                                  event.target.value,
                                )
                              }
                            >
                              <option value="open">Open</option>
                              <option value="investigating">
                                Investigating
                              </option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </td>

                          <td>{incident.source}</td>

                          <td>
                            {new Date(incident.created_at).toLocaleString()}
                          </td>

                          <td>
                            <button
                              className="action-button"
                              title="View details"
                              onClick={() => setSelectedIncident(incident)}
                            >
                              <Eye size={17} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          /* Upload Logs Page */
          <>
            <section className="welcome-section">
              <div>
                <h1>Upload Application Logs</h1>
                <p>
                  Upload log files to detect errors and automatically create
                  incidents.
                </p>
              </div>

              <div className="system-status">
                <span className="status-dot"></span>
                Log Analysis
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Import Log File</h2>
                  <p>
                    Supported formats: .log and .txt · Maximum size: 5 MB
                  </p>
                </div>
              </div>

              <label
                htmlFor="log-file-input"
                className="upload-dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFileSelection(event.dataTransfer.files[0]);
                }}
              >
                <div className="upload-icon">
                  <CloudUpload size={42} />
                </div>

                <h3>Drag and drop your log file here</h3>
                <p>or click to browse files from your computer</p>

                <span className="view-button">
                  <Upload size={16} />
                  Choose File
                </span>

                <input
                  id="log-file-input"
                  type="file"
                  accept=".log,.txt,text/plain"
                  hidden
                  onChange={(event) => {
                    handleFileSelection(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>

              {selectedFile && (
                <div className="selected-file">
                  <div className="selected-file-info">
                    <FileText size={24} />
                    <div>
                      <strong>{selectedFile.name}</strong>
                      <small>
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </small>
                    </div>
                  </div>

                  <button
                    className="action-button"
                    title="Remove file"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X size={19} />
                  </button>
                </div>
              )}

              {uploadError && (
                <div className="error-message">
                  <AlertCircle size={18} />
                  {uploadError}
                </div>
              )}

              <div className="upload-actions">
                <button
                  className="view-button"
                  disabled={!selectedFile || uploading}
                  onClick={() => void handleLogUpload()}
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CloudUpload size={17} />
                      Upload and Analyze
                    </>
                  )}
                </button>
              </div>
            </section>

            {uploadResult && (
              <>
                <section className="content-card">
                  <div className="section-heading">
                    <div>
                      <h2>
                        <CheckCircle2
                          size={21}
                          style={{
                            display: "inline",
                            verticalAlign: "middle",
                            marginRight: 8,
                          }}
                        />
                        Upload Completed
                      </h2>
                      <p>{uploadResult.filename}</p>
                    </div>
                  </div>

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-top">
                        <span>Total Lines</span>
                        <FileText size={20} />
                      </div>
                      <h2>{uploadResult.total_lines}</h2>
                      <p>Lines processed</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span>Detected</span>
                        <AlertTriangle size={20} />
                      </div>
                      <h2>{uploadResult.detected_count}</h2>
                      <p>Matching log entries</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span>Created</span>
                        <CheckCircle2 size={20} />
                      </div>
                      <h2>{uploadResult.created_count}</h2>
                      <p>New incidents created</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-top">
                        <span>Duplicates</span>
                        <RefreshCw size={20} />
                      </div>
                      <h2>{uploadResult.duplicate_count}</h2>
                      <p>Already recorded incidents</p>
                    </div>
                  </div>
                </section>

                <section className="content-card">
                  <div className="section-heading">
                    <div>
                      <h2>Newly Created Incidents</h2>
                      <p>Incidents generated from the uploaded log file</p>
                    </div>
                  </div>

                  {uploadResult.created_incidents.length === 0 ? (
                    <p className="empty-state">
                      No new incidents were created from this upload.
                    </p>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>INCIDENT</th>
                            <th>SEVERITY</th>
                            <th>STATUS</th>
                            <th>SOURCE</th>
                          </tr>
                        </thead>

                        <tbody>
                          {uploadResult.created_incidents.map((incident) => (
                            <tr key={incident.id}>
                              <td>
                                <strong>{incident.title}</strong>
                                <small className="incident-id">
                                  ID: {incident.id}
                                </small>
                              </td>

                              <td>
                                <span
                                  className={`severity ${incident.severity}`}
                                >
                                  {incident.severity}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`incident-status ${incident.status}`}
                                >
                                  {incident.status}
                                </span>
                              </td>

                              <td>{incident.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <button
                    className="view-button"
                    onClick={() => setPage("incidents")}
                  >
                    View All Incidents
                  </button>
                </section>
              </>
            )}
          </>
        )}

        <footer className="footer">
          AI Incident Intelligence Platform · Built with React and FastAPI
        </footer>
      </main>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedIncident(null)}
        >
          <div
            className="incident-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="modal-eyebrow">
                  INCIDENT #{selectedIncident.id}
                </span>

                <h2>{selectedIncident.title}</h2>
              </div>

              <button
                className="action-button"
                onClick={() => setSelectedIncident(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-badges">
              <span className={`severity ${selectedIncident.severity}`}>
                {selectedIncident.severity}
              </span>

              <span className={`incident-status ${selectedIncident.status}`}>
                {selectedIncident.status}
              </span>
            </div>

            <div className="detail-group">
              <label>Description</label>
              <p>{selectedIncident.description}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-group">
                <label>Source</label>
                <p>{selectedIncident.source}</p>
              </div>

              <div className="detail-group">
                <label>Created</label>
                <p>{new Date(selectedIncident.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="detail-group">
              <label>Update Status</label>

              <select
                value={selectedIncident.status}
                onChange={(event) =>
                  void handleUpdate(
                    selectedIncident,
                    "status",
                    event.target.value,
                  )
                }
                disabled={updatingId === selectedIncident.id}
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="detail-group">
              <label>Update Severity</label>

              <select
                value={selectedIncident.severity}
                onChange={(event) =>
                  void handleUpdate(
                    selectedIncident,
                    "severity",
                    event.target.value,
                  )
                }
                disabled={updatingId === selectedIncident.id}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
