import React from "react";

// PUBLIC_INTERFACE
function PageHome({ go, user }) {
  return (
    <div className="container" style={{ paddingTop: 120, marginBottom: 24 }}>
      <div className="hero">
        <div className="subtitle">A Civic Engagement Platform</div>
        <h1 className="title" style={{ color: 'var(--accent)' }}>Welcome to CivicConnect</h1>
        <div className="description">
          Easily report civic issues, track their progress, and help improve your community.
          <br />
          <strong style={{ color: 'var(--secondary)' }}>Get involved & make a difference.</strong>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-large" style={{ background: 'var(--secondary)' }} onClick={() => go('report')}>Report Issue</button>
          <button className="btn btn-large" onClick={() => go('myissues')} disabled={!user}>My Issues</button>
          <button className="btn btn-large" onClick={() => go('admin')} disabled={!user || user.role !== 'admin'}>Admin</button>
        </div>
      </div>
    </div>
  );
}

export default PageHome;
