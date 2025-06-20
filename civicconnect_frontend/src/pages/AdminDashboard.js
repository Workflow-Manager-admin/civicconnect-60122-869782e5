import React, { useEffect, useState } from "react";

const LOCAL_ISSUES_KEY = "civicconnect_issues";

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "#ff4e36" },
  { value: "in_progress", label: "In Progress", color: "#dbbb0e" },
  { value: "resolved", label: "Resolved", color: "#10be63" }
];

// PUBLIC_INTERFACE
export default function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    setIssues(
      JSON.parse(localStorage.getItem(LOCAL_ISSUES_KEY) || "[]")
        .slice()
        .reverse()
    );
  }

  function handleChangeStatus(issueId, newStatus) {
    let arr = JSON.parse(localStorage.getItem(LOCAL_ISSUES_KEY) || "[]");
    let idx = arr.findIndex(issue => issue.id === issueId);
    if (idx > -1) {
      arr[idx].status = newStatus;
      localStorage.setItem(LOCAL_ISSUES_KEY, JSON.stringify(arr));
      refresh();
    }
  }

  function handleDelete(issueId) {
    let arr = JSON.parse(localStorage.getItem(LOCAL_ISSUES_KEY) || "[]");
    arr = arr.filter(issue => issue.id !== issueId);
    localStorage.setItem(LOCAL_ISSUES_KEY, JSON.stringify(arr));
    refresh();
  }

  const issuesFiltered =
    statusFilter === "all"
      ? issues
      : issues.filter(issue => issue.status === statusFilter);

  return (
    <section className="container">
      <div className="card">
        <h2>Admin Dashboard</h2>
        <div style={{marginBottom:18}}>
          <label htmlFor="status-filter">Status Filter:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width:160, marginLeft:12, background:"var(--input-bg)", color:"var(--accent)" }}
          >
            <option value="all">All</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {issuesFiltered.length === 0 && (
          <p>No issues found for filter.</p>
        )}
        {issuesFiltered.length > 0 && (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reported At</th>
                  <th>Photo</th>
                  <th>Location</th>
                  <th>Change Status</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {issuesFiltered.map(issue => (
                  <tr key={issue.id}>
                    <td>{issue.title}</td>
                    <td>{issue.type}</td>
                    <td>
                      <span className={`issue-status ${issue.status}`}>
                        {statusLabel(issue.status)}
                      </span>
                    </td>
                    <td>{(new Date(issue.created)).toLocaleString()}</td>
                    <td>
                      {issue.photo && <img src={issue.photo} alt="issue" style={{width:52, borderRadius:6}} />}
                    </td>
                    <td>
                      {issue.location
                        ? (<>{issue.location.lat.toFixed(3)}, {issue.location.lng.toFixed(3)}</>)
                        : "—"}
                    </td>
                    <td>
                      <select
                        value={issue.status}
                        onChange={e => handleChangeStatus(issue.id, e.target.value)}
                        style={{ background:"var(--input-bg)", color:"var(--accent)" }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option value={opt.value} key={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="secondary-btn" style={{fontSize: "0.9rem"}} onClick={() => handleDelete(issue.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function statusLabel(status) {
  switch (status) {
    case "open": return "Open";
    case "in_progress": return "In Progress";
    case "resolved": return "Resolved";
    default: return status;
  }
}
