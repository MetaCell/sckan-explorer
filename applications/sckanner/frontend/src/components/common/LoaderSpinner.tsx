import { Box, CircularProgress } from '@mui/material';

interface LoaderSpinnerProps {
  text?: string;
}

const LoaderSpinner: React.FC<LoaderSpinnerProps> = ({ text }) => {
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
      {text && <div id="loader_text">{text}</div>}
    </Box>
  );
};

export default LoaderSpinner;
