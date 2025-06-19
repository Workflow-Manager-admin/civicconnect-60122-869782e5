import React, { useEffect, useRef } from "react";

// PUBLIC_INTERFACE
/**
 * GoogleMap component that displays a Google Map with a marker at the given coordinates.
 *
 * Props:
 *   lat: latitude (number) for the marker and map center
 *   lng: longitude (number) for the marker and map center
 *   onMapLoaded?: function (optional) called after map is loaded and marker is set
 */
function GoogleMap({ lat, lng, onMapLoaded }) {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markerRef = useRef(null);

  // Helper to inject Google Maps script only once
  function loadScript(src, id) {
    if (document.getElementById(id)) return;
    const tag = document.createElement("script");
    tag.src = src;
    tag.id = id;
    tag.async = true;
    tag.defer = true;
    document.body.appendChild(tag);
  }

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      // Inject Google Maps script
      window.initMap = () => {}; // Dummy so callback does not error
      loadScript(
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyB5gZ5e_XhZS42P6I10hWTvLSNZ9znLNg0&callback=initMap&v=weekly",
        "__GOOGLE_MAPS_JS__"
      );
    }
  }, []);

  // When google.maps is available, draw the map
  useEffect(() => {
    if (!lat || !lng) return;

    let interval;
    function tryInitMap() {
      if (window.google && window.google.maps && mapElRef.current && !mapRef.current) {
        // Map not yet initialized
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
          title: "Your Location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
        });
        if (typeof onMapLoaded === "function") onMapLoaded(mapRef.current);
      }
      if (!mapRef.current) {
        interval = setTimeout(tryInitMap, 300);
      }
    }
    tryInitMap();

    return () => {
      clearTimeout(interval);
    };
    // eslint-disable-next-line
  }, [lat, lng]);

  return (
    <div
      ref={mapElRef}
      style={{
        width: "100%",
        minHeight: 280,
        height: 320,
        borderRadius: 8,
        border: "2px solid #333",
        margin: "12px 0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.13)",
      }}
    />
  );
}

export default GoogleMap;
