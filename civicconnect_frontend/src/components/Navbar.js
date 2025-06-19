import React from "react";

// PUBLIC_INTERFACE
function Navbar({ go, user, handleLogout }) {
  return (
    <nav className="navbar" style={{ background: 'var(--primary)' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* App Logo */}
        <div className="logo" style={{ color: 'var(--accent)', fontWeight: 600 }}>
          <span className="logo-symbol" style={{ color: 'var(--secondary)', fontSize: '2rem' }}>★</span> CivicConnect
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="btn" onClick={() => go('home')}>Home</button>
          <button className="btn" onClick={() => go('report')}>Report Issue</button>
          <button className="btn" onClick={() => go('myissues')} disabled={!user}>My Issues</button>
          <button className="btn" onClick={() => go('contact')}>Contact</button>
          {user && user.role === 'admin' && (
            <button className="btn" style={{ fontWeight: 700, color: 'var(--secondary)', border: '1px solid var(--secondary)' }} onClick={() => go('admin')}>Admin</button>
          )}
          {!user ? (
            <>
              <button className="btn" onClick={() => go('login')}>Login</button>
              <button className="btn" onClick={() => go('register')}>Register</button>
            </>
          ) : (
            <span style={{ color: 'var(--accent)', fontSize: '1rem', marginLeft: '10px' }}>
              {user.username}&nbsp;
              <button className="btn" onClick={handleLogout}>Logout</button>
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
