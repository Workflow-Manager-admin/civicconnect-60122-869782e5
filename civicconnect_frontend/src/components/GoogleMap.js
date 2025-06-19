import React, { useEffect, useRef } from "react";

// PUBLIC_INTERFACE
function GoogleMap({ lat, lng, apiKey, style = { width: "100%", height: 240 } }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  useEffect(() => {
    if (!lat || !lng) return;
    // If the script already loaded, just initialize map
    if (window.google && window.google.maps) {
      showMap();
      return;
    }
    // Otherwise, dynamically insert the script
    const scriptId = "google-maps-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.id = scriptId;
      script.onload = showMap;
      document.body.appendChild(script);
    } else {
      // If script tag is present, run showMap when loaded
      document.getElementById(scriptId).addEventListener("load", showMap);
    }

    function showMap() {
      if (!mapRef.current || (mapInstance.current && markerInstance.current)) return;
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: parseFloat(lat), lng: parseFloat(lng) },
        zoom: 15,
        disableDefaultUI: true,
      });
      markerInstance.current = new window.google.maps.Marker({
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        map: mapInstance.current,
      });
    }
    // Cleanup marker and event listeners
    return () => {
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
        markerInstance.current = null;
      }
    };
    // eslint-disable-next-line
  }, [lat, lng, apiKey]);

  return (
    <div
      ref={mapRef}
      style={{
        ...style,
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
        background: "#eee",
      }}
      data-testid="gmaps-container"
    >
      {!lat || !lng ? (
        <div style={{ color: "#888", textAlign: "center", padding: 32 }}>
          Map loading...
        </div>
      ) : null}
    </div>
  );
}

export default GoogleMap;
