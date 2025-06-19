import React from "react";

// PUBLIC_INTERFACE
function PageAdmin({ user, issues, cardStyles, inputStyles, statusColor, errorStyles, handleAdminUpdateIssue }) {
  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ paddingTop: 120 }}>
        <div style={errorStyles}>Admin access only.</div>
      </div>
    );
  }
  return (
    <div className="container" style={{ paddingTop: 120, marginBottom: 48 }}>
      <h2 style={{ color: 'var(--secondary)' }}>Admin Dashboard</h2>
      {issues.length === 0 && (
        <div className="description">No issues reported.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {issues.map(issue =>
          <div key={issue.id} style={cardStyles}>
            <div><b>User:</b> {issue.createdBy}</div>
            <div><b>Type:</b> {issue.type}</div>
            <div><b>Description:</b> {issue.description}</div>
            <div><b>Status:</b>
              <select
                style={inputStyles}
                value={issue.status}
                onChange={e => handleAdminUpdateIssue(issue.id, e.target.value)}
              >
                <option>Submitted</option>
                <option>In Progress</option>
                <option>Resolved</option>
                <option>Rejected</option>
              </select>
              <span style={{ marginLeft: 12, color: statusColor(issue.status, 'admin') }}>{issue.status}</span>
            </div>
            {issue.location && !issue.location.error &&
              <div style={{ fontSize: '0.94em', color: 'var(--text-secondary)' }}><b>Location:</b> {issue.location.lat}, {issue.location.lng}</div>
            }
            {issue.photo && (
              <span style={{ fontSize: '0.94em' }}>Photo attached</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageAdmin;
