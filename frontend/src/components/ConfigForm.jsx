import React, { useState, useEffect } from "react";

function ConfigForm() {
  const [config, setConfig] = useState(null);
  const [detectedPublicIp, setDetectedPublicIp] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(setConfig);

    fetch("/api/status")
      .then(res => res.json())
      .then(status => setDetectedPublicIp(status.detected_public_ip || ""));
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "mam_ip") {
      setConfig(cfg => ({ ...cfg, mam_ip: value }));
    } else {
      setConfig(cfg => ({
        ...cfg,
        mam: {
          ...cfg.mam,
          [name]: type === "checkbox" ? checked : value
        }
      }));
    }
  }

  function handleSave(e) {
    e.preventDefault();
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config)
    }).then(() => alert("Config saved!"));
  }

  function handleCopyIp() {
    if (detectedPublicIp) {
      setConfig(cfg => ({ ...cfg, mam_ip: detectedPublicIp }));
    }
  }

  if (!config) return <section><h2>Configuration</h2><p>Loading...</p></section>;

  return (
    <section>
      <h2>MouseTrap Configuration</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>MAM ID:</label>
          <input name="mam_id" value={config.mam.mam_id} onChange={handleChange} />
        </div>
        <div>
          <label>Session Type:</label>
          <select name="session_type" value={config.mam.session_type} onChange={handleChange}>
            <option value="ip">IP Locked</option>
            <option value="asn">ASN Locked</option>
          </select>
        </div>
        <div>
          <label>Buffer:</label>
          <input type="number" name="buffer" value={config.mam.buffer} onChange={handleChange} />
        </div>
        <div>
          <label>Wedge Hours:</label>
          <input type="number" name="wedge_hours" value={config.mam.wedge_hours} onChange={handleChange} />
        </div>
        <div>
          <label>
            <input type="checkbox" name="vip_enabled" checked={config.mam.vip_enabled} onChange={handleChange} />
            Enable VIP Auto Purchase
          </label>
        </div>
        <div>
          <label>
            MaM IP (override):&nbsp;
            <input
              type="text"
              name="mam_ip"
              value={config.mam_ip || ""}
              onChange={handleChange}
              placeholder="e.g. 203.0.113.99"
              style={{ width: "160px" }}
            />
            <span title="Copy detected public IP">
              {detectedPublicIp && (
                <>
                  <button type="button" onClick={handleCopyIp} style={{
                    marginLeft: "8px",
                    padding: "2px 8px",
                    fontSize: "0.9em"
                  }}>
                    Use Detected Public IP
                  </button>
                  <span
                    style={{
                      cursor: "pointer",
                      marginLeft: "8px",
                      fontSize: "1.1em",
                      verticalAlign: "middle"
                    }}
                    onClick={() => navigator.clipboard.writeText(detectedPublicIp)}
                    title="Copy detected public IP to clipboard"
                  >📋</span>
                </>
              )}
            </span>
          </label>
          <div style={{ fontSize: "0.9em", color: "#666" }}>
            Detected Public IP: <b>{detectedPublicIp || "N/A"}</b>
            <br />
            Leave blank to use detected IP, or enter your VPN/public IP if you want MouseTrap to override.
          </div>
        </div>
        <button type="submit">Save</button>
      </form>
    </section>
  );
}

export default ConfigForm;