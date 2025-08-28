import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { renderASN } from '../utils/statusUtils';

export default function NetworkProxyDetailsAccordion({ status }) {
  if (!status) return null;
  // Ensure details is always an object
  const details = status.details || {};
  return (
    <Accordion sx={{ mt: 2, mb: 2, borderRadius: 2, overflow: 'hidden', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5' }} defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Network & Proxy Details</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5' }}>
        <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 0.5, columnGap: 2 }}>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Detected Public IP Address:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.detected_public_ip || "N/A"}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Detected Public ASN:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{renderASN(status.detected_public_ip_asn, status.detected_public_ip_as)}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Proxied Public IP Address:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.proxied_public_ip || "N/A"}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Proxied Public ASN:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{renderASN(status.proxied_public_ip_asn, status.proxied_public_ip_as)}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>MAM Session IP Address:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.current_ip || "N/A"}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>MAM Session ASN:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.current_ip ? renderASN(status.current_ip_asn, status.mam_session_as) : 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Connection Proxied:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{details.proxy && details.proxy.host && String(details.proxy.host).trim() !== '' && details.proxy.port && String(details.proxy.port).trim() !== '' ? "Yes" : "No"}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Auto Update:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{details.auto_update == null
            ? 'N/A'
            : typeof details.auto_update === 'object'
              ? (details.auto_update.msg || details.auto_update.error || JSON.stringify(details.auto_update))
              : String(details.auto_update)}</Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
