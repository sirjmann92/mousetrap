import React from "react";

function StatusPanel({ status }) {
  if (!status) return <section><h2>Status</h2><p>Loading...</p></section>;
  const ipNote =
    status.ip_source === "override"
      ? " (using MaM IP override)"
      : " (detected public IP)";
  return (
    <section>
      <h2>Status</h2>
      <ul>
        <li>MaM Cookie: {status.mam_cookie_exists ? "Present" : "Missing"}</li>
        <li>
          Points:{" "}
          {status.points !== undefined && status.points !== null
            ? status.points
            : <span style={{color: "#888"}}>N/A</span>}
        </li>
        <li>
          Wedge:{" "}
          {status.wedge_active === null || status.wedge_active === undefined
            ? <span style={{color: "#888"}}>N/A</span>
            : status.wedge_active ? "Active" : "Inactive"}
        </li>
        <li>
          VIP:{" "}
          {status.vip_active === null || status.vip_active === undefined
            ? <span style={{color: "#888"}}>N/A</span>
            : status.vip_active ? "Active" : "Inactive"}
        </li>
        <li>
          Current IP: {status.current_ip || <span style={{color: "#888"}}>N/A</span>}
          <span style={{ fontSize: "0.9em", color: "#888" }}>{ipNote}</span>
        </li>
        <li>
          ASN: {status.asn || <span style={{color: "#888"}}>N/A</span>}
        </li>
        <li>
          <em>{status.message}</em>
        </li>
      </ul>
    </section>
  );
}

export default StatusPanel;