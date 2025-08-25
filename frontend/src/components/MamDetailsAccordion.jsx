import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function MamDetailsAccordion({ status }) {
  if (!status || !status.details || !status.details.raw) return null;
  const raw = status.details.raw;
  return (
    <Accordion sx={{ mt: 2, mb: 2, borderRadius: 2, overflow: 'hidden', bgcolor: (theme) => theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5' }} defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>MAM Details</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5' }}>
        <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 0.5, columnGap: 2 }}>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Username:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.username ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>UID:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.uid ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Rank:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.classname ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Connectable:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.connectable ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Country:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.country_name ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Points:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.points !== null && status.points !== undefined ? status.points : 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Downloaded:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.downloaded ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Uploaded:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.uploaded ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Ratio:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.ratio ?? 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Seeding:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.sSat && typeof raw.sSat.count === 'number' ? raw.sSat.count : 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Unsatisfied:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.unsat && typeof raw.unsat.count === 'number' ? raw.unsat.count : 'N/A'}</Typography>
          <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Unsatisfied Limit:</Typography>
          <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.unsat && typeof raw.unsat.limit === 'number' ? raw.unsat.limit : 'N/A'}</Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
