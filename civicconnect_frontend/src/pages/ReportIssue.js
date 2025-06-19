import React, { useState } from "react";
import GoogleMap from "../components/GoogleMap";

// Replace this with your actual API key securely in env or here for demo purposes
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

// PUBLIC_INTERFACE
function PageReportIssue({
  issueForm,
  handleIssueFormChange,
  handleIssueSubmit,
  handleIssueLocation, // not used anymore, replaced by local handleLocationRequest
  authError,
  inputStyles,
  errorStyles
}) {
  // Modal state for asking location permission
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationErrorMsg, setLocationErrorMsg] = useState(""); // only for modal UX

  // Local: perform location and update the form via synthetic event
  const handleLocationRequest = () => {
    setLocationErrorMsg("");
    setShowLocationModal(true);
  };

  // On modal Accept - attempt geolocation, update parent form with synthetic event
  const onAcceptLocation = () => {
    setShowLocationModal(false);
    setLocating(true);
    setLocationErrorMsg("");
    // Synthesize a change event for parent handler on success/fail to use same Redux/lifting logic.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const event = {
            target: {
              name: "location",
              value: {
                lat: pos.coords.latitude.toFixed(5),
                lng: pos.coords.longitude.toFixed(5)
              }
            }
          };
          handleIssueFormChange(event);
          setLocating(false);
        },
        (err) => {
          setLocationErrorMsg("Location access denied.");
          // Update using parent error mechanism
          const event = {
            target: {
              name: "location",
              value: { error: "Location access denied" }
            }
          };
          handleIssueFormChange(event);
          setLocating(false);
        }
      );
    } else {
      setLocationErrorMsg("Geolocation not supported.");
      const event = {
        target: {
          name: "location",
          value: { error: "Geolocation not supported" }
        }
      };
      handleIssueFormChange(event);
      setLocating(false);
    }
  };

  const onDeclineLocation = () => {
    setShowLocationModal(false);
    setLocationErrorMsg("User denied location access.");
    // Update parent to show error if needed
    const event = {
      target: {
        name: "location",
        value: { error: "User denied location access" }
      }
    };
    handleIssueFormChange(event);
  };

  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 520, position: "relative" }}>
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
          onClick={handleLocationRequest}
          disabled={locating}
        >
          {locating
            ? "Getting Location..."
            : (issueForm.location && issueForm.location.lat && issueForm.location.lng)
              ? "Location Captured"
              : "Use My Location"}
        </button>
        {/* Modal */}
        {showLocationModal && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 1000,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            aria-modal="true"
            role="dialog"
          >
            <div
              style={{
                background: "var(--primary)",
                color: "var(--accent)",
                borderRadius: 8,
                padding: 32,
                minWidth: 320,
                maxWidth: "80vw",
                textAlign: "center",
                boxShadow: "0 2px 16px rgba(0,0,0,0.5)",
                border: "1px solid var(--border-color)"
              }}
            >
              <div style={{ fontSize: "1.15rem", marginBottom: 14 }}>
                Allow CivicConnect to access your device location?
              </div>
              <div style={{ color: "var(--text-secondary)", marginBottom: 22 }}>
                This allows us to fill in the issue location automatically. Your location is only used for this report.
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
                <button
                  className="btn"
                  style={{ background: 'var(--secondary)', color: 'var(--accent)' }}
                  onClick={onAcceptLocation}
                  autoFocus
                >
                  Allow
                </button>
                <button
                  className="btn"
                  style={{ background: 'var(--primary)', color: 'var(--secondary)', border: '1px solid var(--secondary)' }}
                  onClick={onDeclineLocation}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Show error if location failure */}
        {(locationErrorMsg || (issueForm.location && issueForm.location.error)) && (
          <div style={errorStyles}>
            {locationErrorMsg ? locationErrorMsg : issueForm.location && issueForm.location.error}
          </div>
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
