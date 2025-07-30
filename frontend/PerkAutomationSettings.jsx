import React, { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material'; // Or use your preferred Tooltip lib
import { fetchConfig, saveConfig } from '../api/config'; // Use your existing API methods

const defaultConfig = {
  perks: {
    upload_credit: {
      enabled: true,
      min_points: 60000,
      buffer: 55000,
      chunk_sizes: [100, 20, 5, 2.5, 1],
      max_purchase_gb: 1000,
      cooldown_minutes: 10,
    },
    vip_status: {
      enabled: true,
      min_points: 1250,
      max_weeks: 12.8,
      cooldown_hours: 24,
      require_power_user: true,
    },
    freeleech_wedge: {
      enabled: true,
      min_points: 50000,
      min_cheese: 5,
      cooldown_hours: 4,
      method: "points",
      prefer_cheese: false,
    },
  },
  general: {
    check_interval_minutes: 15,
    log_level: "info",
  }
};

const logLevels = ["info", "debug", "warning", "error"];
const wedgeMethods = ["points", "cheese", "auto"];

function PerkAutomationSettings() {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    fetchConfig().then(cfg => {
      setConfig(cfg);
      setLoading(false);
    });
  }, []);

  const handleChange = (path, value) => {
    const keys = path.split('.');
    let updated = { ...config };
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setConfig(updated);
  };

  const handleArrayChange = (path, valueStr) => {
    // comma or space separated, convert to array of numbers
    const arr = valueStr.split(/[\s,]+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
    handleChange(path, arr);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveConfig(config);
    setSaveStatus("Settings saved!");
    setSaving(false);
    setTimeout(() => setSaveStatus(""), 2000);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="perk-settings-container" style={{maxWidth: 700, margin: '0 auto'}}>
      <h2>Perk Automation Settings</h2>

      {/* Upload Credit */}
      <section>
        <h3>Upload Credit</h3>
        <Tooltip title="Enable or disable automatic upload credit purchases.">
          <label>
            <input type="checkbox"
              checked={config.perks.upload_credit.enabled}
              onChange={e => handleChange('perks.upload_credit.enabled', e.target.checked)}
            />
            Enable automation
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Minimum bonus points required before buying upload credit.">
          <label>
            Minimum points: <input type="number"
              value={config.perks.upload_credit.min_points}
              onChange={e => handleChange('perks.upload_credit.min_points', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Buffer of points to always retain after purchases. Prevents overspending.">
          <label>
            Buffer: <input type="number"
              value={config.perks.upload_credit.buffer}
              onChange={e => handleChange('perks.upload_credit.buffer', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="GB increments for purchases. Try largest first for efficiency.">
          <label>
            Chunk sizes (GB, comma/space separated): <input type="text"
              value={config.perks.upload_credit.chunk_sizes.join(', ')}
              onChange={e => handleArrayChange('perks.upload_credit.chunk_sizes', e.target.value)}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Maximum GB to purchase at once.">
          <label>
            Max purchase GB: <input type="number"
              value={config.perks.upload_credit.max_purchase_gb}
              onChange={e => handleChange('perks.upload_credit.max_purchase_gb', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Minutes to wait after a purchase before buying again.">
          <label>
            Cooldown (minutes): <input type="number"
              value={config.perks.upload_credit.cooldown_minutes}
              onChange={e => handleChange('perks.upload_credit.cooldown_minutes', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
      </section>
      <hr />

      {/* VIP Status */}
      <section>
        <h3>VIP Status</h3>
        <Tooltip title="Enable or disable automatic VIP purchases.">
          <label>
            <input type="checkbox"
              checked={config.perks.vip_status.enabled}
              onChange={e => handleChange('perks.vip_status.enabled', e.target.checked)}
            />
            Enable automation
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Minimum points required per week of VIP.">
          <label>
            Minimum points per week: <input type="number"
              value={config.perks.vip_status.min_points}
              onChange={e => handleChange('perks.vip_status.min_points', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Maximum weeks of VIP status to hold at any time.">
          <label>
            Max weeks: <input type="number"
              value={config.perks.vip_status.max_weeks}
              onChange={e => handleChange('perks.vip_status.max_weeks', parseFloat(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Hours to wait between VIP purchases.">
          <label>
            Cooldown (hours): <input type="number"
              value={config.perks.vip_status.cooldown_hours}
              onChange={e => handleChange('perks.vip_status.cooldown_hours', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Only buy VIP if you have Power User or VIP rank.">
          <label>
            <input type="checkbox"
              checked={config.perks.vip_status.require_power_user}
              onChange={e => handleChange('perks.vip_status.require_power_user', e.target.checked)}
            />
            Require Power User rank
          </label>
        </Tooltip>
      </section>
      <hr />

      {/* FreeLeech Wedge */}
      <section>
        <h3>FreeLeech Wedge</h3>
        <Tooltip title="Enable or disable automatic FreeLeech Wedge purchases.">
          <label>
            <input type="checkbox"
              checked={config.perks.freeleech_wedge.enabled}
              onChange={e => handleChange('perks.freeleech_wedge.enabled', e.target.checked)}
            />
            Enable automation
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Minimum points required to buy a wedge using bonus points.">
          <label>
            Minimum points: <input type="number"
              value={config.perks.freeleech_wedge.min_points}
              onChange={e => handleChange('perks.freeleech_wedge.min_points', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Minimum cheese required to buy a wedge using cheese.">
          <label>
            Minimum cheese: <input type="number"
              value={config.perks.freeleech_wedge.min_cheese}
              onChange={e => handleChange('perks.freeleech_wedge.min_cheese', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Hours to wait between wedge purchases.">
          <label>
            Cooldown (hours): <input type="number"
              value={config.perks.freeleech_wedge.cooldown_hours}
              onChange={e => handleChange('perks.freeleech_wedge.cooldown_hours', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Select method for wedge purchase: bonus points, cheese, or auto (whichever is available/preferred).">
          <label>
            Method: <select
              value={config.perks.freeleech_wedge.method}
              onChange={e => handleChange('perks.freeleech_wedge.method', e.target.value)}
            >
              {wedgeMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </Tooltip>
        <br />
        <Tooltip title="If checked, always use cheese for wedge purchases if enough is available.">
          <label>
            <input type="checkbox"
              checked={config.perks.freeleech_wedge.prefer_cheese}
              onChange={e => handleChange('perks.freeleech_wedge.prefer_cheese', e.target.checked)}
            />
            Prefer cheese if available
          </label>
        </Tooltip>
      </section>
      <hr />

      {/* General Settings */}
      <section>
        <h3>General Settings</h3>
        <Tooltip title="How often to check and run perk automation tasks (in minutes).">
          <label>
            Check interval (minutes): <input type="number"
              value={config.general.check_interval_minutes}
              onChange={e => handleChange('general.check_interval_minutes', parseInt(e.target.value))}
            />
          </label>
        </Tooltip>
        <br />
        <Tooltip title="Set the logging verbosity level.">
          <label>
            Log level: <select
              value={config.general.log_level}
              onChange={e => handleChange('general.log_level', e.target.value)}
            >
              {logLevels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
            </select>
          </label>
        </Tooltip>
      </section>
      <hr />

      {/* Controls */}
      <div>
        <button onClick={handleSave} disabled={saving}>Save Settings</button>
        {saveStatus && <span style={{ marginLeft: 10, color: 'green' }}>{saveStatus}</span>}
      </div>
    </div>
  );
}

export default PerkAutomationSettings;