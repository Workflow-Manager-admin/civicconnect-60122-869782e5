import React, { useEffect, useRef, useState } from "react";

// PUBLIC_INTERFACE
/**
 * GoogleMap component with location selection (click/drag marker), robust loading/error handling and reverse geocoding.
 *
 * Props:
 *   lat: latitude (number) for map center/marker
 *   lng: longitude (number) for map center/marker
 *   onLocationChange?: function({lat, lng, address}) called when selection changes
 */
function GoogleMap({ lat, lng, onLocationChange }) {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [errorMsg, setErrorMsg] = useState("");
  const [scriptHasError, setScriptHasError] = useState(false);

  // Helper to inject Google Maps script only once, with onerror handler.
  function injectGoogleMapsScript(src, id, onError) {
    if (document.getElementById(id)) return;
    const tag = document.createElement("script");
    tag.src = src;
    tag.id = id;
    tag.async = true;
    tag.defer = true;
    tag.onerror = onError;
    document.body.appendChild(tag);
  }

  // Reverse geocode: returns address or error message
  function reverseGeocodeCoords(lat, lng, cb) {
    if (!window.google || !window.google.maps) {
      cb("");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        cb(results[0].formatted_address);
      } else {
        cb(""); // Could call setErrorMsg("Unable to fetch address")
      }
    });
  }

  // Google Maps script loader: load and check API, show error after timeout if not loaded.
  useEffect(() => {
    let didCancel = false;
    setStatus("loading");
    setErrorMsg("");
    setScriptHasError(false);

    function handleScriptError() {
      setScriptHasError(true);
      setStatus("error");
      setErrorMsg("Failed to load Google Maps (network/API error). Please check your connection or try again later.");
    }

    let loadTimeout;
    if (!window.google || !window.google.maps) {
      // Attach initMap for script, but only set state when loaded by poll below.
      window.initMap = function () {};

      injectGoogleMapsScript(
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyB5gZ5e_XhZS42P6I10hWTvLSNZ9znLNg0&callback=initMap&v=weekly",
        "__GOOGLE_MAPS_JS__",
        handleScriptError
      );

      // Timeout: if not loaded after X sec, show failure banner
      loadTimeout = setTimeout(() => {
        if (!window.google || !window.google.maps) {
          setScriptHasError(true);
          setStatus("error");
          setErrorMsg("Google Maps API failed to load (timeout). Please check your network, browser or API key.");
        }
      }, 7000);
    }

    return () => {
      didCancel = true;
      clearTimeout(loadTimeout);
    };
  }, []);

  // Map & marker setup, with robust error display and ready callback
  useEffect(() => {
    let didUnmount = false;
    let initTimeout;
    setStatus(p => p === "error" ? "error" : "loading");

    function setErrorBanner(msg) {
      setStatus("error");
      setErrorMsg(msg);
    }

    // Edge: no coordinates to render
    if (!lat || !lng) {
      setErrorBanner("No valid coordinates for map display.");
      return;
    }

    // Clean-up old map
    if (mapRef.current) {
      mapRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current = null;
    }

    function tryInitMap() {
      if (
        didUnmount ||
        (typeof window.google === "undefined") ||
        (typeof window.google.maps === "undefined")
      ) {
        initTimeout = setTimeout(tryInitMap, 280);
        return;
      }

      if (!mapElRef.current) {
        setErrorBanner("Internal error: map container unavailable.");
        return;
      }

      // Only initialize once.
      if (!mapRef.current) {
        try {
          mapRef.current = new window.google.maps.Map(mapElRef.current, {
            center: { lat, lng },
            zoom: 16,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });
          markerRef.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: mapRef.current,
            title: "Reported Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
            draggable: true,
          });

          // Map click: move marker and update location
          mapRef.current.addListener("click", (e) => {
            const clickLat = e.latLng.lat();
            const clickLng = e.latLng.lng();
            markerRef.current.setPosition({ lat: clickLat, lng: clickLng });
            mapRef.current.panTo({ lat: clickLat, lng: clickLng });
            handleLocationUpdate(clickLat, clickLng);
          });
          // Marker drag end
          markerRef.current.addListener("dragend", (e) => {
            const dragLat = e.latLng.lat();
            const dragLng = e.latLng.lng();
            mapRef.current.panTo({ lat: dragLat, lng: dragLng });
            handleLocationUpdate(dragLat, dragLng);
          });
          // Initial: fire update, do reverse geocode
          handleLocationUpdate(lat, lng);

          setStatus("ready");
        } catch (e) {
          setErrorBanner("Google Maps failed to render (API runtime error).");
        }
      }
    }

    // Only start if no script error signaled.
    if (!scriptHasError) {
      // Fire up the poller
      tryInitMap();
    }

    function handleLocationUpdate(newLat, newLng) {
      reverseGeocodeCoords(newLat, newLng, (addr) => {
        setAddress(addr || "");
        if (typeof onLocationChange === "function") {
          onLocationChange({ lat: newLat, lng: newLng, address: addr });
        }
      });
    }

    return () => {
      didUnmount = true;
      clearTimeout(initTimeout);
    };
    // Only run when lat/lng/scriptHasError changes
    // eslint-disable-next-line
  }, [lat, lng, scriptHasError]);

  // Update marker/address if props change
  useEffect(() => {
    if (
      window.google &&
      window.google.maps &&
      markerRef.current &&
      mapRef.current &&
      lat &&
      lng
    ) {
      markerRef.current.setPosition({ lat, lng });
      mapRef.current.panTo({ lat, lng });
      reverseGeocodeCoords(lat, lng, setAddress);
    }
    // eslint-disable-next-line
  }, [lat, lng]);

  return (
    <div style={{ width: "100%", marginBottom: 8 }}>
      {status === "error" && (
        <div style={{
          background: "#340012",
          color: "#ff5d5d",
          borderRadius: 6,
          border: "2px solid #ff3131",
          marginBottom: 12,
          padding: "12px 15px",
          fontWeight: 500,
          fontSize: 15
        }}>
          <span>⚠️ {errorMsg || "A map error occurred."}</span>
        </div>
      )}
      {status !== "error" &&
        <div
          ref={mapElRef}
          style={{
            width: "100%",
            minHeight: 280,
            height: 320,
            borderRadius: 8,
            border: status === "ready" ? "2px solid #333" : "2px solid #888",
            margin: "12px 0",
            boxShadow: "0 1px 8px rgba(0,0,0,0.13)",
            background: status === "loading" ? "repeating-linear-gradient(45deg, #222 0px, #222 18px, #444 18px, #444 36px)" : "#121316",
            opacity: status === "loading" ? 0.7 : 1,
            position: "relative"
          }}
        >
          {status === "loading" &&
            <div style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              background: "rgba(5,10,20,0.48)",
              color: "#80ffb2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 500,
              zIndex: 10
            }}>
              Loading map...
            </div>
          }
        </div>
      }
      {/* Address output */}
      {(address && status === "ready") && (
        <div style={{
          color: "#80ffb2",
          background: "#161f18",
          margin: "8px 0 0 0",
          padding: "10px 12px",
          borderRadius: 7,
          fontSize: 14,
          border: "1.5px solid #204d31",
          wordBreak: "break-word"
        }}>
          <span style={{fontWeight: 500, color: "#12ff90"}}>Address:</span>
          {" "}
          <span>{address}</span>
        </div>
      )}
      {/* Address fallback */}
      {(!address && status === "ready") && (
        <div style={{
          color: "#ffc081",
          background: "#18181a",
          margin: "8px 0 0 0",
          padding: "8px 10px",
          borderRadius: 7,
          fontSize: 13,
          border: "1.5px solid #44380b",
          wordBreak: "break-word"
        }}>
          Unable to determine address for this location. Please double-check.
        </div>
      )}
    </div>
  );
}

export default GoogleMap;
