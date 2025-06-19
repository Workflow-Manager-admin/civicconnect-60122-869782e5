import React from "react";
import GoogleMap from "../components/GoogleMap";

// Replace this with your actual API key securely in env or here for demo purposes
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

// PUBLIC_INTERFACE
function PageReportIssue({
  issueForm,
  handleIssueFormChange,
  handleIssueSubmit,
  handleIssueLocation,
  authError,
  inputStyles,
  errorStyles
}) {
  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 520 }}>
      <h2 style={{ color: 'var(--secondary)' }}>Report a Civic Issue</h2>
      <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <select
          name="type"
          value={issueForm.type}
          onChange={handleIssueFormChange}
          style={inputStyles}
          required
        >
          <option value="">Select Issue Type</option>
          <option value="Pothole">Pothole</option>
          <option value="Streetlight">Streetlight</option>
          <option value="Garbage">Garbage</option>
          <option value="Water Leakage">Water Leakage</option>
          <option value="Other">Other</option>
        </select>
        <textarea
          name="description"
          placeholder="Describe the issue..."
          value={issueForm.description}
          onChange={handleIssueFormChange}
          style={{ ...inputStyles, minHeight: 60, resize: 'vertical' }}
          required
          maxLength={400}
        />
        <input
          type="file"
          name="photo"
          accept="image/*"
          onChange={handleIssueFormChange}
          style={inputStyles}
        />
        <button
          className="btn"
          type="button"
          style={{ background: 'var(--secondary)', color: 'var(--accent)' }}
          onClick={handleIssueLocation}
        >
          {issueForm.location ? 'Location Captured' : 'Use My Location'}
        </button>
        {/* Show error if location failure */}
        {issueForm.location && issueForm.location.error && (
          <div style={errorStyles}>{issueForm.location.error}</div>
        )}
        {/* Show map if location is available with lat/lng */}
        {issueForm.location && issueForm.location.lat && issueForm.location.lng && (
          <GoogleMap
            lat={parseFloat(issueForm.location.lat)}
            lng={parseFloat(issueForm.location.lng)}
            apiKey={GOOGLE_MAPS_API_KEY}
            style={{ width: "100%", height: 200 }}
          />
        )}
        <button className="btn btn-large" style={{ marginTop: 10 }} type="submit">Submit Issue</button>
      </form>
      {authError && <div style={errorStyles}>{authError}</div>}
    </div>
  );
}

export default PageReportIssue;
