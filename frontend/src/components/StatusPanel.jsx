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
        <li>MaM Cookie: {status.mam_cookie_exists ? "OK" : "Missing"}</li>
        <li>
          Points:{" "}
          {status.points !== undefined && status.points !== null
            ? status.points
            : <span style={{color: "#888"}}>N/A</span>}
        </li>
        <li>
          Wedge Automation:{" "}
          {status.wedge_automation || <span style={{color: "#888"}}>N/A</span>}
        </li>
        <li>
          VIP Automation:{" "}
          {status.vip_automation || <span style={{color: "#888"}}>N/A</span>}
        </li>
        <li>
          Upload Automation:{" "}
          {status.upload_automation || <span style={{color: "#888"}}>N/A</span>}
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