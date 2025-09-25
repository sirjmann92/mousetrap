import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Tooltip } from '@mui/material';
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
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, m: 0, p: 0 }}>
          {/* Column 1: Username, UID, Rank, Connectable, Points, Downloaded, Uploaded */}
          <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 0.5, columnGap: 2 }}>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Username:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.username ?? 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>UID:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.uid ?? 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Rank:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.classname ?? 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Connectable:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.connectable ?? 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Points:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{status.points !== null && status.points !== undefined ? status.points : 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Downloaded:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.downloaded ?? 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Uploaded:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.uploaded ?? 'N/A'}</Typography>
          </Box>

          {/* Column 2: Overall Ratio, Currently Seeding, Unsatisfied, Unsatisfied Limit, Active H&R, Inactive H&R, Inactive Unsatisfied */}
          <Box component="dl" sx={{ m: 0, p: 0, display: 'grid', gridTemplateColumns: 'max-content auto', rowGap: 0.5, columnGap: 2 }}>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Overall Ratio:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.ratio ?? 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Currently Seeding:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.sSat && typeof raw.sSat.count === 'number' ? raw.sSat.count : 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Unsatisfied:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.unsat && typeof raw.unsat.count === 'number' ? raw.unsat.count : 'N/A'}</Typography>
            <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>Unsatisfied Limit:</Typography>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.unsat && typeof raw.unsat.limit === 'number' ? raw.unsat.limit : 'N/A'}</Typography>
            <Tooltip title="Seeding" arrow>
              <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2, cursor: 'help' }}>Active H&amp;R:</Typography>
            </Tooltip>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.seedHnr && typeof raw.seedHnr.count === 'number' ? raw.seedHnr.count : 'N/A'}</Typography>
            <Tooltip title="Not Seeding" arrow>
              <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2, cursor: 'help' }}>Inactive H&amp;R:</Typography>
            </Tooltip>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.inactHnr && typeof raw.inactHnr.count === 'number' ? raw.inactHnr.count : 'N/A'}</Typography>
            <Tooltip title="Pre-H&R" arrow>
              <Typography component="dt" sx={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2, cursor: 'help' }}>Inactive Unsatisfied:</Typography>
            </Tooltip>
            <Typography component="dd" sx={{ m: 0, fontSize: '0.92rem', lineHeight: 1.3, py: 0.2 }}>{raw.inactUnsat && typeof raw.inactUnsat.count === 'number' ? raw.inactUnsat.count : 'N/A'}</Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
