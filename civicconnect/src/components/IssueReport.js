import React, { useState } from "react";

/**
 * IssueReport
 * Allows users to submit new civic issues.
 * Features: description, type, (photo upload), geolocation (stub), validation.
 */

const issueTypes = [
  "Pothole", "Streetlight", "Garbage", "Water Leak",
  "Graffiti", "Noise", "Tree/Shrubbery", "Other"
];

// PUBLIC_INTERFACE
function IssueReport({ session }) {
  const [form, setForm] = useState({
    title: "",
    type: "",
    details: "",
    photo: null,
    location: null
  });
  const [locateStatus, setLocateStatus] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      setForm(f => ({ ...f, photo: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Get user location (via Geolocation API)
  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocateStatus("Geolocation is unavailable.");
      return;
    }
    setLocateStatus("Locating...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }
        }));
        setLocateStatus("Location attached ✔");
      },
      (err) => {
        setLocateStatus("Location not available.");
      }
    );
  };

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    // Simple validation
    if (!form.title || !form.type || !form.details) {
      setSubmitStatus("Fill in all required fields.");
      return;
    }
    setSubmitStatus("Issue submitted! (Simulated; see Issue Status)");
    // Here, an API call would be made and submission cleared.
    // For now, you could reset the form or simulate tracking in localstorage.
  }

  return (
    <div className="container" style={{ padding: "44px 0", maxWidth: 520 }}>
      <h2 className="title" style={{ fontSize: "2.2rem" }}>Report an Issue</h2>
      <form className="form" onSubmit={handleSubmit} autoComplete="off">
        <div style={{ margin: "18px 0" }}>
          <label style={{ display: "block", marginBottom: 6 }}>Title<span style={{color:"#ff0000"}}>*</span></label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input"
            maxLength={60}
            required
            style={{width:"100%"}}
          />
        </div>
        <div style={{ margin: "18px 0" }}>
          <label style={{ display: "block", marginBottom: 6 }}>Type<span style={{color:"#ff0000"}}>*</span></label>
          <select name="type" className="input" value={form.type} onChange={handleChange} required style={{width:"100%"}}>
            <option value="">Select Type</option>
            {issueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div style={{ margin: "18px 0" }}>
          <label style={{ display: "block", marginBottom: 6 }}>Details<span style={{color:"#ff0000"}}>*</span></label>
          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            className="input"
            required
            style={{width:"100%", minHeight:"68px"}}
            maxLength={500}
            placeholder="Describe the issue, location, severity, etc."
          />
        </div>
        <div style={{ margin: "18px 0" }}>
          <label style={{ display: "block", marginBottom: 6 }}>Photo (optional)</label>
          <input
            type="file"
            name="photo"
            accept="image/jpeg, image/png"
            onChange={handleChange}
            className="input"
          />
        </div>
        <div style={{ margin: "18px 0" }}>
          <button
            type="button"
            className="btn"
            onClick={handleLocate}
            disabled={!!form.location}
          >
            {form.location ? "Location Attached" : "Attach My Location"}
          </button>
          <span style={{marginLeft:12, color:"var(--text-secondary)"}}>{locateStatus}</span>
        </div>
        <button type="submit" className="btn btn-large" style={{marginTop:12}}>
          Submit Issue
        </button>
        <div style={{marginTop:10, color:"#ff0000",minHeight:22}}>{submitStatus}</div>
      </form>
    </div>
  );
}

export default IssueReport;
