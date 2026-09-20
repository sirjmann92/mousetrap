import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tooltip,
  Typography,
} from '@mui/material';

/**
 * Format MAM's `vip_until` timestamp for display, with days remaining.
 *
 * MAM sends "YYYY-MM-DD HH:MM:SS", which browsers parse inconsistently, so the
 * value is normalised to ISO before being read as UTC. The day count is marked
 * approximate because whether MAM means UTC or site-local is still unconfirmed.
 *
 * @param {any} vipUntil Raw `vip_until` value from jsonLoad.php.
 * @returns {string} The timestamp with days remaining, or 'N/A' when absent.
 */
function formatVipUntil(vipUntil) {
  if (typeof vipUntil !== 'string' || !vipUntil.trim()) return 'N/A';
  const parsed = new Date(`${vipUntil.trim().replace(' ', 'T')}Z`);
  if (Number.isNaN(parsed.getTime())) return vipUntil;
  const days = Math.floor((parsed.getTime() - Date.now()) / 86400000);
  if (days < 0) return `${vipUntil} (expired)`;
  return `${vipUntil} (≈${days} ${days === 1 ? 'day' : 'days'} left)`;
}

export default function MamDetailsAccordion({ status }) {
  if (!status?.details?.raw) return null;
  const raw = status.details.raw;
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
          MAM Details
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#272626' : '#f5f5f5'),
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { sm: '1fr 1fr', xs: '1fr' },
            m: 0,
            p: 0,
          }}
        >
          {/* Column 1: Username, UID, Rank, Connectable, Points, Downloaded, Uploaded */}
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
              Username:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.username ?? 'N/A'}
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
              UID:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.uid ?? 'N/A'}
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
              Rank:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.classname ?? 'N/A'}
            </Typography>
            <Tooltip title="When your VIP status expires, as reported by MAM.">
              <Typography
                component="dt"
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  py: 0.2,
                }}
              >
                VIP Expires:
              </Typography>
            </Tooltip>
            <Typography
              component="dd"
              data-testid="mam-details-vip-until"
              sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}
            >
              {formatVipUntil(raw.vip_until)}
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
              Connectable:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.connectable ?? 'N/A'}
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
              Points:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {status.points !== null && status.points !== undefined ? status.points : 'N/A'}
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
              Downloaded:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.downloaded ?? 'N/A'}
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
              Uploaded:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.uploaded ?? 'N/A'}
            </Typography>
          </Box>

          {/* Column 2: Overall Ratio, Currently Seeding, Unsatisfied, Unsatisfied Limit, Active H&R, Inactive H&R, Inactive Unsatisfied */}
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
              Overall Ratio:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.ratio ?? 'N/A'}
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
              Currently Seeding:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.sSat && typeof raw.sSat.count === 'number' ? raw.sSat.count : 'N/A'}
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
              Unsatisfied:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.unsat && typeof raw.unsat.count === 'number' ? raw.unsat.count : 'N/A'}
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
              Unsatisfied Limit:
            </Typography>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.unsat && typeof raw.unsat.limit === 'number' ? raw.unsat.limit : 'N/A'}
            </Typography>
            <Tooltip arrow title="Seeding">
              <Typography
                component="dt"
                sx={{
                  cursor: 'help',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  py: 0.2,
                }}
              >
                Active H&amp;R:
              </Typography>
            </Tooltip>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.seedHnr && typeof raw.seedHnr.count === 'number' ? raw.seedHnr.count : 'N/A'}
            </Typography>
            <Tooltip arrow title="Not Seeding">
              <Typography
                component="dt"
                sx={{
                  cursor: 'help',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  py: 0.2,
                }}
              >
                Inactive H&amp;R:
              </Typography>
            </Tooltip>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.inactHnr && typeof raw.inactHnr.count === 'number' ? raw.inactHnr.count : 'N/A'}
            </Typography>
            <Tooltip arrow title="Pre-H&R">
              <Typography
                component="dt"
                sx={{
                  cursor: 'help',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  py: 0.2,
                }}
              >
                Inactive Unsatisfied:
              </Typography>
            </Tooltip>
            <Typography component="dd" sx={{ fontSize: '0.92rem', lineHeight: 1.3, m: 0, py: 0.2 }}>
              {raw.inactUnsat && typeof raw.inactUnsat.count === 'number'
                ? raw.inactUnsat.count
                : 'N/A'}
            </Typography>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
