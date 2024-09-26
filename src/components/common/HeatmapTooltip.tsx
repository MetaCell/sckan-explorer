import { FC } from 'react';
import { vars } from '../../theme/variables';
import { Box, Tooltip, Typography } from '@mui/material';
const { gray25, gray300 } = vars;

export interface HeatmapTooltipRow {
  color?: string;
  name?: string;
  count: number;
}

interface HeatmapTooltipProps {
  x: string;
  y: string;
  connections: number;
  rows?: HeatmapTooltipRow[];
}

const commonHeadingStyles = {
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
  color: gray300,
};

const commonTextStyles = {
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: '1.125rem',
  color: gray25,
};

const HeatmapTooltip: FC<HeatmapTooltipProps> = ({
  x,
  y,
  connections,
  rows,
}) => {
  const hasRows = rows && rows.length > 0;

  if (connections === 0) {
    return <></>;
  } else {
    return (
      <Tooltip
        arrow
        placement="right"
        title={
          <Box minWidth={140}>
            <Typography
              sx={{
                ...commonHeadingStyles,
                marginBottom: '0.125rem',
              }}
            >{`${y} -> ${x}`}</Typography>
            <Box display="flex" flexDirection="column" gap={'0.25rem'}>
              {hasRows ? (
                rows.map((row, index) => (
                  <Box
                    key={index}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box gap="0.375rem" display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: '1.4794rem',
                          height: '1rem',
                          background: row.color || 'transparent',
                        }}
                      />
                      <Typography sx={commonTextStyles}>
                        {row.name || ''}
                      </Typography>
                    </Box>
                    <Typography sx={commonTextStyles}>{row.count}</Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ ...commonTextStyles, marginTop: '0.125rem' }}>
                  {`${connections} connections`}
                </Typography>
              )}
            </Box>
          </Box>
        }
      >
        <Box sx={{ opacity: 0 }}>{x}</Box>
      </Tooltip>
    );
  }
};

export default HeatmapTooltip;
