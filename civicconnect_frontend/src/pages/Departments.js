import React from "react";

// PUBLIC_INTERFACE
export default function Departments() {
  const departments = [
    {
      name: "Public Works",
      email: "publicworks@civicconnect.local",
      phone: "123-456-7891"
    },
    {
      name: "Sanitation",
      email: "sanitation@civicconnect.local",
      phone: "123-456-7892"
    },
    {
      name: "Street Lighting",
      email: "streetlight@civicconnect.local",
      phone: "123-456-7893"
    },
    {
      name: "Water Supply",
      email: "water@civicconnect.local",
      phone: "123-456-7894"
    },
    {
      name: "Noise Control",
      email: "noise@civicconnect.local",
      phone: "123-456-7895"
    },
  ];
  return (
    <section className="container">
      <div className="card">
        <h2>City Departments</h2>
        <p>Contact the relevant city department directly for specific concerns.</p>
        <table style={{width:"100%",color:"var(--accent)",borderCollapse:"collapse", background:"none"}}>
          <thead>
            <tr>
              <th>Department</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(dept => (
              <tr key={dept.name}>
                <td>{dept.name}</td>
                <td><a href={`mailto:${dept.email}`}>{dept.email}</a></td>
                <td><a href={`tel:${dept.phone}`}>{dept.phone}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
