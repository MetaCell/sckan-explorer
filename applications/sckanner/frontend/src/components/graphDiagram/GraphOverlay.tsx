import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { vars } from '../../theme/variables';

const { primaryPurple500 } = vars;

interface GraphOverlayProps {
  duration?: number; // Duration in milliseconds
  onComplete?: () => void;
}

const GraphOverlay: React.FC<GraphOverlayProps> = ({
  duration = 2000,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) {
    return null;
  }

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="rgba(255, 255, 255, 0.98)"
      zIndex={1000}
      sx={{
        minHeight: '50rem',
        width: '100%',
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: primaryPurple500,
        }}
      />
    </Box>
  );
};

export default GraphOverlay;
