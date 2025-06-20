import React from "react";

/**
 * Contact
 * Static contact info page for CivicConnect support or municipal contact.
 */

// PUBLIC_INTERFACE
function Contact() {
  return (
    <div className="container" style={{ padding: "44px 0", maxWidth: 540 }}>
      <h2 className="title" style={{ fontSize: "2rem" }}>Contact Us</h2>
      <div style={{color:"#eee", margin:"24px 0"}}>
        <p>
          <strong>Email:</strong><br />
          <a href="mailto:info@civicconnect.city" style={{color: "#ff0000"}}>info@civicconnect.city</a>
        </p>
        <p>
          <strong>Phone:</strong><br />
          <span style={{color:"#fff"}}>+1 (555) 123-4567</span>
        </p>
        <p>
          <strong>Mail:</strong><br />
          CivicConnect Office<br />
          123 Main St<br />
          Metro City, Country 12345
        </p>
      </div>
      <div style={{color:"#aaa", fontSize:"1.04rem"}}>
        For urgent city maintenance, call your district’s emergency services. For technical support with this application, email us.
      </div>
    </div>
  );
}

export default Contact;
