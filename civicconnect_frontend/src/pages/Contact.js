import React from "react";

// PUBLIC_INTERFACE
export default function Contact() {
  return (
    <section className="container">
      <div className="card" style={{maxWidth: 500, margin: "2rem auto"}}>
        <h2>Contact Us</h2>
        <p>
          For general inquiries, feedback or urgent issues, please contact:
        </p>
        <ul>
          <li>
            <strong>Email:</strong> <a href="mailto:info@civicconnect.local">info@civicconnect.local</a>
          </li>
          <li>
            <strong>Phone:</strong> <a href="tel:1234567890">123-456-7890</a>
          </li>
          <li>
            <strong>Address:</strong> 100 Civic Dr, Metro City
          </li>
        </ul>
        <p>
          For department-specific issues, check the <a href="/departments" style={{color: "var(--secondary)"}}>Departments</a> page.
        </p>
      </div>
    </section>
  );
}
