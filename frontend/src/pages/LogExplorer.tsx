
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

import {
  getLogEntries,
  type LogEntry,
} from "../services/api";

import "./LogExplorer.css";

const PAGE_SIZE = 10;

function LogExplorer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [filename, setFilename] = useState("");
  const [severity, setSeverity] = useState("");

  const [sortBy, setSortBy] = useState<
    "created_at" | "line_number" | "severity" | "filename"
  >("created_at");

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getLogEntries({
          search: search || undefined,
          filename: filename || undefined,
          severity: severity || undefined,
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          sort_by: sortBy,
          order,
        });

        if (!cancelled) {
          setLogs(data.logs);
          setTotal(data.total);
        }
      } catch (err) {
        console.error("Log loading failed:", err);

        if (!cancelled) {
          setError(
            "Unable to load logs. Please check your backend server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void loadLogs();
    }, search ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, filename, severity, page, sortBy, order]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFilterChange = (
    setter: (value: string) => void,
    value: string
  ) => {
    setter(value);
    setPage(0);
  };

  const handleRefresh = () => {
    // Trigger a fresh request without changing the current filters.
    setPage((current) => current);
    void refreshLogs();
  };

  const refreshLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLogEntries({
        search: search || undefined,
        filename: filename || undefined,
        severity: severity || undefined,
        skip: page * PAGE_SIZE,
        limit: PAGE_SIZE,
        sort_by: sortBy,
        order,
      });

      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error("Log refresh failed:", err);
      setError("Unable to refresh logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="log-explorer-page">
      <section className="welcome-section">
        <div>
          <h1>Application Logs</h1>
          <p>
            Search, filter and investigate stored application log entries.
          </p>
        </div>

        <div className="system-status">
          <span className="status-dot"></span>
          Log Intelligence
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <h2>Log Explorer</h2>
            <p>
              {total} matching log entr{total === 1 ? "y" : "ies"}
            </p>
          </div>

          <button className="view-button" onClick={handleRefresh}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="log-toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search log messages..."
              value={search}
              onChange={(event) =>
                handleFilterChange(setSearch, event.target.value)
              }
            />
          </div>

          <input
            className="log-filename-input"
            type="text"
            placeholder="Filter filename..."
            value={filename}
            onChange={(event) =>
              handleFilterChange(setFilename, event.target.value)
            }
          />

          <select
            value={severity}
            onChange={(event) =>
              handleFilterChange(setSeverity, event.target.value)
            }
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="log-toolbar log-sort-toolbar">
          <div className="log-sort-label">
            <Filter size={16} />
            <span>Sort logs</span>
          </div>

          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(
                event.target.value as
                  | "created_at"
                  | "line_number"
                  | "severity"
                  | "filename"
              );
              setPage(0);
            }}
          >
            <option value="created_at">Created Date</option>
            <option value="line_number">Line Number</option>
            <option value="severity">Severity</option>
            <option value="filename">Filename</option>
          </select>

          <select
            value={order}
            onChange={(event) => {
              setOrder(event.target.value as "asc" | "desc");
              setPage(0);
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="log-results">
          {loading ? (
            <div className="log-empty">
              <RefreshCw size={24} />
              <p>Loading log entries...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="log-empty">
              <FileText size={32} />
              <h3>No log entries found</h3>
              <p>
                Try changing your search or filters, or upload a log file.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <article className="log-entry-card" key={log.id}>
                <div className="log-entry-header">
                  <div className="log-file-info">
                    <FileText size={17} />
                    <strong>{log.filename}</strong>
                    <span>Line {log.line_number}</span>
                  </div>

                  <span className={`severity ${log.severity}`}>
                    {log.severity}
                  </span>
                </div>

                <div className="log-message">
                  {log.message}
                </div>

                <div className="log-entry-footer">
                  <span>Log ID: #{log.id}</span>
                  <span>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="log-pagination">
          <span>
            Showing {total === 0 ? 0 : page * PAGE_SIZE + 1}
            {" - "}
            {Math.min((page + 1) * PAGE_SIZE, total)}
            {" of "}
            {total}
          </span>

          <div>
            <button
              className="action-button"
              disabled={page === 0 || loading}
              onClick={() => setPage((current) => current - 1)}
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="log-page-number">
              {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </span>

            <button
              className="action-button"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LogExplorer;
