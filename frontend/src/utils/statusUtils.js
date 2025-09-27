// Utility to robustly stringify any message for snackbars
export function stringifyMessage(msg) {
  if (typeof msg === 'string') return msg;
  if (msg instanceof Error) return msg.message;
  if (msg === undefined || msg === null) return '';
  try {
    return JSON.stringify(msg);
  } catch {
    return String(msg);
  }
}

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
// Helper to extract ASN number and provide tooltip for full AS string
import React from 'react';

export function renderASN(asn, fullAs) {
  let asnNum = asn;
  const match = asn && typeof asn === 'string' ? asn.match(/(AS)?(\d+)/i) : null;
  if (match) asnNum = match[2];
  return (
    <span style={{ display: 'flex', alignItems: 'center' }}>
      {asnNum || 'N/A'}
      {fullAs && (
        <Tooltip title={fullAs} arrow>
          <IconButton size="small" sx={{ ml: 0.5, p: 0.2 }}>
            <InfoOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      )}
    </span>
  );
}
