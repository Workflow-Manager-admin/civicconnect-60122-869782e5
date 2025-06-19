import React from "react";

// PUBLIC_INTERFACE
function PageContact({ deptGridStyles, deptCardStyles }) {
  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 680 }}>
      <h2 style={{ color: 'var(--accent)' }}>Contact & Departments</h2>
      <div className="description">Contact us below or reach out to the relevant department.</div>
      <div style={deptGridStyles}>
        <div style={deptCardStyles}>
          <h4 style={{ color: 'var(--secondary)' }}>Public Works</h4>
          <div>publicworks@civicconnect.gov</div>
          <div>Phone: 123-456-1001</div>
        </div>
        <div style={deptCardStyles}>
          <h4 style={{ color: 'var(--secondary)' }}>Garbage/Sanitation</h4>
          <div>sanitation@civicconnect.gov</div>
          <div>Phone: 123-456-1010</div>
        </div>
        <div style={deptCardStyles}>
          <h4 style={{ color: 'var(--secondary)' }}>Water Dept</h4>
          <div>waterdept@civicconnect.gov</div>
          <div>Phone: 123-456-1022</div>
        </div>
        <div style={deptCardStyles}>
          <h4 style={{ color: 'var(--secondary)' }}>Streetlights</h4>
          <div>lights@civicconnect.gov</div>
          <div>Phone: 123-456-1099</div>
        </div>
      </div>
      <div style={{ marginTop: 24, color: 'var(--accent)' }}>
        General contact: info@civicconnect.gov
      </div>
    </div>
  );
}

export default PageContact;
