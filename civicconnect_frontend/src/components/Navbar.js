import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">CivicConnect</div>
      <div className="nav-links">
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
        {user && (
          <>
            <NavLink to="/report" className="nav-link">
              Report Issue
            </NavLink>
            <NavLink to="/my-issues" className="nav-link">
              My Issues
            </NavLink>
          </>
        )}
        {isAdmin() && (
          <NavLink to="/admin" className="nav-link">
            Admin
          </NavLink>
        )}
        <NavLink to="/departments" className="nav-link">
          Departments
        </NavLink>
        <NavLink to="/contact" className="nav-link">
          Contact
        </NavLink>
        {user ? (
          <>
            <span className="profile-name">{user.name}</span>
            <button className="secondary-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
            <NavLink to="/register" className="nav-link">
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
