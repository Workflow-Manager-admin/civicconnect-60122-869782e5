import React from "react";

const Home = () => (
  <section className="container">
    <div className="card">
      <h1>Welcome to CivicConnect</h1>
      <p>
        CivicConnect empowers citizens to report civic issues, check their status, and helps
        authorities efficiently address community needs.{" "}
        <br />
        <strong>Register or log in to get started!</strong>
      </p>
      <ul>
        <li>Submit issues anonymously or with your account</li>
        <li>Upload photos, include your location</li>
        <li>Check real-time status of your submissions</li>
        <li>Contact city departments directly for information</li>
      </ul>
    </div>
  </section>
);

export default Home;
