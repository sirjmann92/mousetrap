import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { renderASN } from '../utils/statusUtils.jsx';

export default function NetworkProxyDetailsAccordion({ status }) {
  if (!status) return null;
  // Ensure details is always an object
  const _details = status.details || {};
  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        borderRadius: 2,
        mb: 2,
        mt: 2,
        overflow: 'hidden',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        }}
      >
        <Typography sx={{ fontWeight: 600 }} variant="subtitle2">
          Network & Proxy Details
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        }}
      >
        <Box
          component="dl"
          sx={{
            columnGap: 2,
            display: 'grid',
            gridTemplateColumns: 'max-content auto',
            m: 0,
            p: 0,
            rowGap: 0.5,
          }}
        >
          <Typography
            component="dt"
            sx={{
              fontSize: '0.92rem',
              fontWeight: 500,
              lineHeight: 1.3,
              py: 0.2,
            }}
          >
            Detected Public IP Address:
          </Typography>
          <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
            {status.detected_public_ip || 'N/A'}
          </Typography>
          <Typography
            component="dt"
            sx={{
              fontSize: '0.92rem',
              fontWeight: 500,
              lineHeight: 1.3,
              py: 0.2,
            }}
          >
            Detected Public ASN:
          </Typography>
          <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
            {renderASN(status.detected_public_ip_asn, status.detected_public_ip_as)}
          </Typography>
          <Typography
            component="dt"
            sx={{
              fontSize: '0.92rem',
              fontWeight: 500,
              lineHeight: 1.3,
              py: 0.2,
            }}
          >
            Proxied Public IP Address:
          </Typography>
          <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
            {status.proxied_public_ip || 'N/A'}
          </Typography>
          <Typography
            component="dt"
            sx={{
              fontSize: '0.92rem',
              fontWeight: 500,
              lineHeight: 1.3,
              py: 0.2,
            }}
          >
            Proxied Public ASN:
          </Typography>
          <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
            {renderASN(status.proxied_public_ip_asn, status.proxied_public_ip_as)}
          </Typography>
          <Typography
            component="dt"
            sx={{
              fontSize: '0.92rem',
              fontWeight: 500,
              lineHeight: 1.3,
              py: 0.2,
            }}
          >
            MAM Session IP Address:
          </Typography>
          <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
            {status.current_ip || 'N/A'}
          </Typography>
          <Typography
            component="dt"
            sx={{
              fontSize: '0.92rem',
              fontWeight: 500,
              lineHeight: 1.3,
              py: 0.2,
            }}
          >
            MAM Session ASN:
          </Typography>
          <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
            {status.current_ip ? renderASN(status.current_ip_asn, null) : 'N/A'}
          </Typography>
          <Typography
            component="dt"
            sx={{
              fontSize: '0.92rem',
              fontWeight: 500,
              lineHeight: 1.3,
              py: 0.2,
            }}
          >
            Connection Proxied:
          </Typography>
          <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
            {status.proxied_public_ip && status.proxied_public_ip !== 'N/A' ? 'Yes' : 'No'}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
