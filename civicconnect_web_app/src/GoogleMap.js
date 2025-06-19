import React, { useEffect, useRef, useState } from "react";

// PUBLIC_INTERFACE
/**
 * GoogleMap component with location selection (click/drag marker) and reverse geocoding.
 *
 * Props:
 *   lat: latitude (number) for initial marker/map center
 *   lng: longitude (number) for initial marker/map center
 *   onLocationChange?: function({lat, lng, address}) called when user selects new location
 *   onMapLoaded?: function (optional) called after map is loaded and marker is set
 */
function GoogleMap({ lat, lng, onLocationChange, onMapLoaded }) {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markerRef = useRef(null);
  const [address, setAddress] = useState("");

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

  // Helper for reverse geocode using Google Maps Geocoder
  function reverseGeocodeCoords(lat, lng, cb) {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        cb(results[0].formatted_address);
      } else {
        cb("");
      }
    });
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

  // Initialize map & marker, enable user interaction
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

        // Event: map click
        mapRef.current.addListener("click", (e) => {
          const clickLat = e.latLng.lat();
          const clickLng = e.latLng.lng();
          markerRef.current.setPosition({ lat: clickLat, lng: clickLng });
          mapRef.current.panTo({ lat: clickLat, lng: clickLng });
          handleLocationUpdate(clickLat, clickLng);
        });

        // Event: marker drag end
        markerRef.current.addListener("dragend", (e) => {
          const dragLat = e.latLng.lat();
          const dragLng = e.latLng.lng();
          mapRef.current.panTo({ lat: dragLat, lng: dragLng });
          handleLocationUpdate(dragLat, dragLng);
        });

        // Do initial reverse geocoding & notify parent
        handleLocationUpdate(lat, lng);

        if (typeof onMapLoaded === "function") onMapLoaded(mapRef.current);
      }
      if (!mapRef.current) {
        interval = setTimeout(tryInitMap, 300);
      }
    }

    // Location update handler
    function handleLocationUpdate(newLat, newLng) {
      reverseGeocodeCoords(newLat, newLng, (addressRes) => {
        setAddress(addressRes);
        if (typeof onLocationChange === "function") {
          onLocationChange({ lat: newLat, lng: newLng, address: addressRes });
        }
      });
    }

    tryInitMap();

    return () => {
      clearTimeout(interval);
    };
    // eslint-disable-next-line
  }, [lat, lng]);

  // If lat/lng props change (from outside), update marker and reverse geocode
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
      {/* Address output */}
      {address && (
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
    </div>
  );
}

export default GoogleMap;
