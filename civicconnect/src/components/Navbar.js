import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

/*
  Navbar supports:
  - Dynamic session and role awareness
  - Navigation for citizens (login/register/report/my-issues/contact...)
  - Admin quick link when signed in as admin
  - Dark theme and color palette support via CSS
  - Logout button
*/

// PUBLIC_INTERFACE
function Navbar({ session, onLogout }) {
  const navigate = useNavigate();
  const isAdmin = session && session.role === "admin";
  const isAuthed = !!session;

  // Handle logout
  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <nav className="navbar" role="navigation">
      <div className="container" style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
        <span className="logo">
          <span className="logo-symbol">*</span>{" "}
          <span style={{fontWeight:600}}>CivicConnect</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/departments" className="nav-link">Departments</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {isAuthed && (
            <>
              <Link to="/report" className="nav-link">Report Issue</Link>
              <Link to="/my-issues" className="nav-link">My Issues</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="nav-link nav-admin">Admin</Link>
          )}
          {!isAuthed ? (
            <>
              <Link to="/login" className="btn nav-btn" style={{marginLeft:8}}>Login</Link>
              <Link to="/register" className="btn btn-secondary nav-btn">Sign Up</Link>
            </>
          ) : (
            <button className="btn btn-secondary nav-btn" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
