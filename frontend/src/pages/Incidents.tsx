
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import {
  getIncidents,
  type Incident,
  type IncidentFilters,
} from "../services/api";

import "../App.css";

function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const limit = 5;

  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const filters: IncidentFilters = {
        search,
        severity,
        status,
        skip,
        limit,
      };

      const data = await getIncidents(filters);
      setIncidents(data);
    } catch (err) {
      console.error("Failed to load incidents:", err);
      setError("Unable to load incidents. Check your backend.");
    } finally {
      setLoading(false);
    }
  }, [search, severity, status, skip]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadIncidents();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadIncidents]);

  const resetFilters = () => {
    setSearch("");
    setSeverity("");
    setStatus("");
    setSkip(0);
  };

  return (
    <main className="main-content">
      <header className="topbar">
        <div>
          <h2>Incident Management</h2>
          <p>Search, filter and manage application incidents.</p>
        </div>
      </header>

      <section className="welcome-section">
        <div>
          <h1>All Incidents</h1>
          <p>Investigate incidents detected from your application logs.</p>
        </div>
      </section>

      <section className="content-card">
        <div className="incident-toolbar">

          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSkip(0);
              }}
            />
          </div>

          <select
            value={severity}
            onChange={(event) => {
              setSeverity(event.target.value);
              setSkip(0);
            }}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setSkip(0);
            }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
          </select>

          <button className="icon-button" onClick={resetFilters}>
            <RefreshCw size={18} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID / INCIDENT</th>
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
                    <AlertTriangle size={25} />
                    <p>No matching incidents found.</p>
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
                      <span className={`incident-status ${incident.status}`}>
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

        <div className="pagination">
          <button
            className="pagination-button"
            disabled={skip === 0 || loading}
            onClick={() => setSkip(Math.max(0, skip - limit))}
          >
            <ChevronLeft size={17} />
            Previous
          </button>

          <span>Page {Math.floor(skip / limit) + 1}</span>

          <button
            className="pagination-button"
            disabled={incidents.length < limit || loading}
            onClick={() => setSkip(skip + limit)}
          >
            Next
            <ChevronRight size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default Incidents;
