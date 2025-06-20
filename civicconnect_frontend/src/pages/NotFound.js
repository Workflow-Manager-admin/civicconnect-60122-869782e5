import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function NotFound() {
  return (
    <section className="container">
      <div className="card" style={{textAlign: "center"}}>
        <h2>404 - Page Not Found</h2>
        <p>
          Sorry, we couldn't find that page.
        </p>
        <Link to="/" className="btn">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
