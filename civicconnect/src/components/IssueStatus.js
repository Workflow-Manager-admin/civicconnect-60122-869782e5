import React, { useEffect, useState } from "react";

/**
 * IssueStatus
 * Simulates status tracking of the user's submitted issues.
 * In a real app, data would come from backend API.
 */

// For demo, store and load issue reports from localStorage:
function getFakeIssues(username) {
  // Simulate some static issues for the user for demo
  return [
    {
      id: 1,
      title: "Pothole on 3rd Ave",
      type: "Pothole",
      details: "Large pothole near intersection, quite dangerous.",
      date: "2024-05-11",
      status: "In Progress"
    },
    {
      id: 2,
      title: "Streetlight out",
      type: "Streetlight",
      details: "Lamp post #24 in park not working.",
      date: "2024-05-08",
      status: "Resolved"
    },
    {
      id: 3,
      title: "Illegal dumping",
      type: "Garbage",
      details: "Trash bags dumped in alley.",
      date: "2024-05-06",
      status: "Received"
    }
  ];
}

// PUBLIC_INTERFACE
function IssueStatus({ session }) {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Would load from API; here, simulate per user
    if (session) {
      setIssues(getFakeIssues(session.username));
    }
  }, [session]);

  return (
    <div className="container" style={{ padding: "36px 0 60px 0", minHeight: "65vh" }}>
      <h2 className="title" style={{ fontSize: "2rem" }}>My Reported Issues</h2>
      {issues.length === 0 ? (
        <div style={{ color: "#aaa", marginTop: "32px" }}>
          No issues reported yet.
        </div>
      ) : (
        <table style={{ width: "100%", background: "#0f1014", borderRadius: 10, boxShadow: "0 1px 6px #0005" }}>
          <thead>
            <tr style={{ background: "#222" }}>
              <th style={{color:"#ff0000",padding:"12px"}}>Date</th>
              <th style={{color:"#fff",padding:"12px"}}>Title</th>
              <th style={{color:"#fff",padding:"12px"}}>Type</th>
              <th style={{color:"#fff",padding:"12px"}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue.id}>
                <td style={{padding:"10px",color:"#fff"}}>{issue.date}</td>
                <td style={{padding:"10px",color:"#fff"}}>{issue.title}</td>
                <td style={{padding:"10px",color:"#fff"}}>{issue.type}</td>
                <td style={{padding:"10px",fontWeight:600, color: issue.status === "Resolved" ? "#13ff8a" : issue.status === "In Progress" ? "#ffe34e" : "#ff0000"}}>
                  {issue.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default IssueStatus;
