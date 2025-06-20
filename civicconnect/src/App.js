import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import UserDashboard from "./components/UserDashboard";
import IssueReport from "./components/IssueReport";
import IssueStatus from "./components/IssueStatus";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Contact from "./components/Contact";
import Departments from "./components/Departments";

function App() {
  // Hold the current user session
  const [session, setSession] = useState(() => {
    // Load session from localStorage or default null
    try {
      return JSON.parse(localStorage.getItem("session")) || null;
    } catch (e) {
      return null;
    }
  });

  // Update localStorage on session change
  useEffect(() => {
    localStorage.setItem("session", JSON.stringify(session));
  }, [session]);

  // Logout handler
  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem("session");
  };

  // Role helpers
  const isAdmin = session && session.role === "admin";
  const isAuthed = !!session;

  return (
    <Router>
      <div className="app">
        <Navbar
          session={session}
          onLogout={handleLogout}
        />
        <main style={{ flex: '1 0 auto', paddingTop: 80, minHeight: "80vh" }}>
            <Routes>
              {/* Redirect if already authed */}
              <Route
                path="/register"
                element={!isAuthed ? <Register setSession={setSession} /> : <Navigate to="/" />}
              />
              <Route
                path="/login"
                element={!isAuthed ? <Login setSession={setSession} /> : <Navigate to="/" />}
              />

              {/* Main User Dashboard or Welcome */}
              <Route
                path="/"
                element={isAuthed ? <UserDashboard session={session} /> : (
                  <div className="container" style={{padding:"90px 0 50px 0", minHeight:"70vh"}}>
                    <div className="hero">
                      <div className="subtitle">CivicConnect</div>
                      <h1 className="title">Welcome</h1>
                      <div className="description">
                        CivicConnect helps citizens report issues, track their status, and contact local departments—all securely.
                      </div>
                      <div>
                        <Link to="/login" className="btn btn-large" style={{marginRight: 16}}>Login</Link>
                        <Link to="/register" className="btn btn-large btn-secondary">Sign Up</Link>
                      </div>
                    </div>
                  </div>
                )}
              />

              {/* User actions */}
              <Route
                path="/report"
                element={isAuthed ? <IssueReport session={session} /> : <Navigate to="/login" />}
              />
              <Route
                path="/my-issues"
                element={isAuthed ? <IssueStatus session={session} /> : <Navigate to="/login" />}
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={isAdmin ? <AdminDashboard session={session} /> : <Navigate to={isAuthed ? "/" : "/login"} />}
              />

              {/* Static pages */}
              <Route
                path="/contact"
                element={<Contact />}
              />
              <Route
                path="/departments"
                element={<Departments />}
              />

              {/* Catch-all: redirect to home */}
              <Route
                path="*"
                element={<Navigate to="/" />}
              />
            </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;