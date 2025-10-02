import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export function renderASN(asn, fullAs) {
  let asnNum = asn;
  const match = asn && typeof asn === 'string' ? asn.match(/(AS)?(\d+)/i) : null;
  if (match) asnNum = match[2];
  return (
    <span style={{ alignItems: 'center', display: 'flex' }}>
      {asnNum || 'N/A'}
      {fullAs && (
        <Tooltip arrow title={fullAs}>
          <IconButton size="small" sx={{ ml: 0.5, p: 0.2 }}>
            <InfoOutlinedIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      )}
    </span>
  );
}
