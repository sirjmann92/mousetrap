import React from "react";

function StatusPanel({ status }) {
  if (!status) return <section><h2>Status</h2><p>Loading...</p></section>;
  return (
    <section>
      <h2>Status</h2>
      <ul>
        <li>MaM Cookie: {status.mam_cookie_exists ? "Present" : "Missing"}</li>
        <li>Points: {status.points}</li>
        <li>Wedge: {status.wedge_active ? "Active" : "Inactive"}</li>
        <li>VIP: {status.vip_active ? "Active" : "Inactive"}</li>
        <li>Current IP: {status.current_ip}</li>
        <li>ASN: {status.asn}</li>
        <li><em>{status.message}</em></li>
      </ul>
    </section>
  );
}

export default StatusPanel;