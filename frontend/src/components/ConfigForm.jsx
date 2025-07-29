import React, { useState, useEffect } from "react";

function ConfigForm() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(setConfig);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setConfig(cfg => ({
      ...cfg,
      mam: {
        ...cfg.mam,
        [name]: type === "checkbox" ? checked : value
      }
    }));
  }

  function handleSave(e) {
    e.preventDefault();
    fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config)
    }).then(() => alert("Config saved!"));
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
        <button type="submit">Save</button>
      </form>
    </section>
  );
}

export default ConfigForm;