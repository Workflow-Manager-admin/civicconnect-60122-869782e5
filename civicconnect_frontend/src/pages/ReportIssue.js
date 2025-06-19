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

  // Improved: Use Permissions API to check geolocation permission, retry as needed
  const onAcceptLocation = async () => {
    setShowLocationModal(false);
    setLocating(true);
    setLocationErrorMsg("");
    const updateLocation = (lat, lng) => {
      const event = {
        target: {
          name: "location",
          value: { lat, lng }
        }
      };
      handleIssueFormChange(event);
      setLocating(false);
    };
    const updateLocationError = (errorMsg) => {
      setLocationErrorMsg(errorMsg);
      const event = {
        target: {
          name: "location",
          value: { error: errorMsg }
        }
      };
      handleIssueFormChange(event);
      setLocating(false);
    };

    // Optionally check permission state first for more reliable UX
    if (navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        if (perm.state === 'denied') {
          updateLocationError("Location permission denied in browser settings.");
          return;
        }
        // If prompt or granted, proceed
      } catch { /* ignore */ }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Defensive: check that coordinates are present
          if (pos && pos.coords && typeof pos.coords.latitude === 'number' && typeof pos.coords.longitude === 'number') {
            updateLocation(
              pos.coords.latitude.toFixed(5),
              pos.coords.longitude.toFixed(5)
            );
          } else {
            updateLocationError("Failed to read geolocation coordinates.");
          }
        },
        (err) => {
          if (err && typeof err.code !== 'undefined') {
            // See https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
            if (err.code === 1)
              updateLocationError("Location access denied by user.");
            else if (err.code === 2)
              updateLocationError("Position unavailable.");
            else if (err.code === 3)
              updateLocationError("Timed out while trying to get location.");
            else
              updateLocationError("Location access denied.");
          } else {
            updateLocationError("Location access denied.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds to avoid hanging forever
          maximumAge: 30000 // Accept up to 30s old cached
        }
      );
    } else {
      updateLocationError("Geolocation not supported.");
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
