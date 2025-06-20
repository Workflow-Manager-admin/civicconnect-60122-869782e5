import React from "react";
import { Link } from "react-router-dom";

/**
 * UserDashboard
 * Shows a quick summary and links for logged-in citizen users.
 * Can be expanded later with more personalized info or stats.
 */
// PUBLIC_INTERFACE
function UserDashboard({ session }) {
  return (
    <div className="container" style={{ padding: "36px 0 60px 0", minHeight: "65vh" }}>
      <div className="hero" style={{padding:"24px 0"}}>
        <div className="subtitle">Welcome, {session && session.username}!</div>
        <h2 className="title">Your Dashboard</h2>
        <div className="description">
          <p>
            Here you can report new civic issues, view your previous submissions, and track their statuses.
          </p>
        </div>
        <div style={{display:"flex",gap:"18px"}}>
          <Link to="/report" className="btn btn-large">
            Report a New Issue
          </Link>
          <Link to="/my-issues" className="btn btn-large btn-secondary">
            View My Issues
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
