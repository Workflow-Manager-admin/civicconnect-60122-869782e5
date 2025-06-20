import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LOCAL_ISSUES_KEY = "civicconnect_issues";

// PUBLIC_INTERFACE
export default function ReportIssue() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    photo: null,
    photoUrl: "",
    location: null
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadingLoc, setLoadingLoc] = useState(false);
  const navigate = useNavigate();

  const issueTypes = [
    "Road Damage",
    "Garbage/Sanitation",
    "Streetlight",
    "Water Supply",
    "Noise/Disturbance",
    "Other"
  ];

  function validate({ title, description, type }) {
    if (!title || !description || !type) return "All fields required";
    if (title.length < 4) return "Title too short";
    if (title.length > 50) return "Title too long";
    if (description.length < 8) return "Description too short";
    return "";
  }

  // PUBLIC_INTERFACE
  function handleChange(e) {
    let { name, value, type: inputType, files } = e.target;
    if (inputType === "file") {
      const file = files[0];
      if (file && !/\.png$|\.jpe?g$|\.gif$/i.test(file.name)) {
        setError("Only image files allowed"); return;
      }
      setForm(f => ({ ...f, photo: file, photoUrl: file ? URL.createObjectURL(file) : "" }));
      setError("");
    } else {
      setForm(f => ({ ...f, [name]: value }));
      setError("");
    }
  }

  // PUBLIC_INTERFACE
  function handleLocation() {
    setLoadingLoc(true);
    setForm(f => ({ ...f, location: null }));
    if (!navigator.geolocation) {
      setError("Geolocation not supported"); setLoadingLoc(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(f => ({
          ...f,
          location: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }
        }));
        setLoadingLoc(false);
      },
      err => {
        setError("Failed to get location: " + err.message);
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    const validation = validate(form);
    if (validation) {
      setError(validation); return;
    }
    // Store base64 of image for demo purposes
    let base64 = null;
    if (form.photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        base64 = reader.result;
        saveIssue(base64);
      };
      reader.readAsDataURL(form.photo);
    } else {
      saveIssue(null);
    }
  }

  function saveIssue(base64Image) {
    const issues = JSON.parse(localStorage.getItem(LOCAL_ISSUES_KEY) || "[]");
    const newIssue = {
      id: "ISSUE-" + Date.now().toString(36),
      title: form.title,
      description: form.description,
      type: form.type,
      photo: base64Image,
      status: "open",
      location: form.location,
      created: new Date().toISOString()
    };
    issues.push(newIssue);
    localStorage.setItem(LOCAL_ISSUES_KEY, JSON.stringify(issues));
    setStatus("Issue reported successfully!");
    setTimeout(() => navigate("/my-issues"), 1200);
  }

  return (
    <section className="container">
      <div className="card">
        <h2>Report Civic Issue</h2>
        <form autoComplete="off" spellCheck={false} onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input name="title" value={form.title} onChange={handleChange} maxLength={50} />

          <label htmlFor="description">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} />

          <label htmlFor="type">Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="">Select...</option>
            {issueTypes.map(type => (
              <option value={type} key={type}>{type}</option>
            ))}
          </select>

          <label htmlFor="photo">Photo (optional)</label>
          <input name="photo" type="file" accept="image/*" onChange={handleChange} />
          {form.photoUrl && (
            <img src={form.photoUrl} alt="preview" style={{maxWidth:120, marginBottom:8, borderRadius:8}} />
          )}

          <div style={{marginTop:16}}>
            <button type="button" className="secondary-btn" style={{marginBottom:10}} onClick={handleLocation} disabled={loadingLoc}>
              {loadingLoc ? "Detecting..." : "Add My Location"}
            </button>
            {form.location && (
              <span style={{ marginLeft: 12, fontSize:"0.97em", color:"var(--secondary)" }}>
                ({form.location.lat.toFixed(4)}, {form.location.lng.toFixed(4)})
              </span>
            )}
          </div>
          {error && <div className="form-error">{error}</div>}
          {status && <div className="form-success">{status}</div>}
          <button className="btn" type="submit" style={{width:"100%"}}>Submit Issue</button>
        </form>
      </div>
    </section>
  );
}
