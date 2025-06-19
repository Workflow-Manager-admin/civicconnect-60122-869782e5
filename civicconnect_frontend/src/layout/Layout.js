import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// PUBLIC_INTERFACE
function Layout({ children, go, user, handleLogout }) {
  return (
    <div className="app" style={{ background: 'var(--primary)', color: 'var(--accent)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar go={go} user={user} handleLogout={handleLogout} />
      <main style={{ flex: '1 0 auto', minHeight: '60vh', marginTop: 64 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
