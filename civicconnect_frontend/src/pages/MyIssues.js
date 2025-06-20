import React, { useEffect, useState } from "react";

const LOCAL_ISSUES_KEY = "civicconnect_issues";

// PUBLIC_INTERFACE
export default function MyIssues() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    let list = JSON.parse(localStorage.getItem(LOCAL_ISSUES_KEY) || "[]");
    // Newest first
    setIssues(list.slice().reverse());
  }, []);

  return (
    <section className="container">
      <div className="card">
        <h2>My Submitted Issues</h2>
        {issues.length === 0 && (
          <p>No issues submitted yet.</p>
        )}
        {issues.length > 0 && (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",color:"var(--accent)",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reported At</th>
                  <th>Photo</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {issues.map(issue => (
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
