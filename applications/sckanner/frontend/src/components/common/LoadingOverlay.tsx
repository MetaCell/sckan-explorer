import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';
import { vars } from '../../theme/variables.ts';

const { primaryPurple600, white } = vars;

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'Loading data...',
}) => {
  return (
    <Backdrop
      sx={{
        color: white,
        zIndex: (theme) => theme.zIndex.drawer + 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      open={open}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: primaryPurple600 }} size={60} />
        <Typography variant="h6" color="inherit">
          {message}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
