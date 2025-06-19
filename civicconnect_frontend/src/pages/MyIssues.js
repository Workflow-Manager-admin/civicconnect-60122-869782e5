import React from "react";

// PUBLIC_INTERFACE
function PageMyIssues({ issues, user, cardStyles, statusColor }) {
  const myIssues = issues.filter(i => (user && i.createdBy === user.username));
  return (
    <div className="container" style={{ paddingTop: 120, marginBottom: 48 }}>
      <h2 style={{ color: 'var(--accent)' }}>My Reported Issues</h2>
      {myIssues.length === 0 && (
        <div className="description">No issues reported yet.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {myIssues.map(issue =>
          <div key={issue.id} style={cardStyles}>
            <div><b>Type:</b> {issue.type}</div>
            <div><b>Description:</b> {issue.description}</div>
            <div><b>Status:</b> <span style={{ color: statusColor(issue.status, 'user') }}>{issue.status}</span></div>
            {issue.location && !issue.location.error &&
              <div style={{ fontSize: '0.95em', color: 'var(--text-secondary)' }}><b>Location:</b> {issue.location.lat}, {issue.location.lng}</div>
            }
            {issue.photo && <span style={{ fontSize: '0.95em' }}>Photo attached</span>}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageMyIssues;
