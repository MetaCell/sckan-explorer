import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const Loader = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      flexDirection={'column'}
    >
      <CircularProgress id="circular_loader" size={60} />
      <div id="loader_text">Loading data...</div>
    </Box>
  );
};

export default Loader;
