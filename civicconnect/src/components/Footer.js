import React from "react";

// PUBLIC_INTERFACE
function Footer() {
  return (
    <footer className="footer" style={{
      backgroundColor: "#111",
      color: "#aaa",
      padding: "22px 0",
      borderTop: "1px solid #222",
      textAlign: "center",
      marginTop: "32px"
    }}>
      <div>
        &copy; {new Date().getFullYear()} CivicConnect &mdash; Empowering Citizen Engagement
      </div>
      <div style={{fontSize:"0.9em", marginTop: "4px"}}>
        <a href="/contact" style={{ color: "#ff0000", textDecoration: "underline", marginRight:8 }}>Contact</a>
        <a href="/departments" style={{ color: "#fff", textDecoration: "none" }}>Departments</a>
      </div>
    </footer>
  );
}

export default Footer;
