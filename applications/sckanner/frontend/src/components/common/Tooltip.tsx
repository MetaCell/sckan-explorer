import { FC } from 'react';
import { vars } from '../../theme/variables';
import { Box, Tooltip as MaterialTooltip, Typography } from '@mui/material';
import { type TooltipProps as MaterialTooltipProps } from '@mui/material';
const { gray25, gray300 } = vars;

interface TooltipProps extends Omit<MaterialTooltipProps, 'title'> {
  heading?: string;
  body: string | React.ReactNode;
  minWidth?: number;
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

const Tooltip: FC<TooltipProps> = ({
  heading,
  body,
  minWidth,
  children,
  ...tooltipProps
}) => {
  const isContentString = typeof body === 'string';

  return (
    <MaterialTooltip
      {...tooltipProps}
      title={
        <Box minWidth={minWidth}>
          <Typography
            sx={{
              ...commonHeadingStyles,
              marginBottom: '0.125rem',
            }}
          >
            {heading}
          </Typography>
          {isContentString ? (
            <Typography sx={{ ...commonTextStyles, marginTop: '0.125rem' }}>
              {body}
            </Typography>
          ) : (
            <>{body}</>
          )}
        </Box>
      }
    >
      {children}
    </MaterialTooltip>
  );
};

export default Tooltip;
