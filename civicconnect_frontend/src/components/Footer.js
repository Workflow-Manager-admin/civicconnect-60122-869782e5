import React from "react";

// PUBLIC_INTERFACE
function Footer() {
  return (
    <footer style={{
      background: 'var(--primary)',
      color: 'var(--accent)',
      padding: '20px 0',
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)',
      fontSize: '0.95rem',
      textAlign: 'center'
    }}>
      © 2024 CivicConnect.
    </footer>
  );
}

export default Footer;
