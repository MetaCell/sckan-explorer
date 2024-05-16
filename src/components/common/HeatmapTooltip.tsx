import { FC } from "react";
import { vars } from "../../theme/variables";
import { Box, Tooltip, Typography } from "@mui/material";
const {  gray25, gray300 } = vars;

interface HeatmapTooltipProps {
  value: number;
  x: number;
  y: number;
  secondary?: boolean;
  getCellBgColor: (value: number) => string;
}

const commonHeadingStyles = {
  fontSize: '0.75rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
  color: gray300
}

const commonTextStyles = {
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: '1.125rem',
  color: gray25,
}
const HeatmapTooltip: FC<HeatmapTooltipProps> = ({value, x, y, secondary, getCellBgColor}) => {
  let data;
  if (secondary) {
    data = (
      <Box minWidth={140}>
        <Typography sx={{
          ...commonHeadingStyles,
          marginBottom: '0.125rem'

        }}>{`${y} -> ${x}`}</Typography>
        <Box display='flex' flexDirection='column' gap={'0.25rem'}>
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Box gap='0.375rem' display='flex' alignItems='center'>
              <Box sx={{
                width: '1.4794rem', 
                height: '1rem', 
                background: getCellBgColor(value)
              }} 
              />
              <Typography sx={commonTextStyles}>
                {x}
              </Typography>
            </Box>
            <Typography sx={commonTextStyles}>
              {value}
            </Typography>
          </Box>

          <Box display='flex' justifyContent='space-between'>
            <Box gap='0.375rem' display='flex' alignItems='center'>
              <Box sx={{
                width: '1.4794rem', 
                height: '1rem', 
                background: getCellBgColor(value)
              }} 
              />
              <Typography sx={{...commonTextStyles,
                lineHeight: '1'
              }}>
                {y}
              </Typography>
            </Box>
            <Typography sx={commonTextStyles}>
              {value}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  } else {
    data = (
      <Box>
        <Typography sx={{...commonTextStyles,
          fontWeight: 500,
          color: gray300
        }}>{`${y} -> ${x}`}</Typography>
        <Typography sx={
          {...commonTextStyles,
          marginTop: '0.125rem'
        }}>{`${value}`} connections</Typography>
      </Box>
    )
  }
  return (
    <Tooltip
      arrow
      placement="right"
      title={data}
    >
      <Box sx={{ opacity: 0 }}>{value}</Box>
    </Tooltip>
  )
}

export default HeatmapTooltip;
  