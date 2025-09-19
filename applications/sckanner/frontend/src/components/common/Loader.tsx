import { Box, LinearProgress } from '@mui/material';
import { vars } from '../../theme/variables';
// import MinimalLogo from '../assets/svg/logo-minimal.svg';
import MinimalLogo from '../assets/gif/loader_logo.gif';

interface LoaderProps {
  progress: number;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ progress, text }) => {
  const { primaryPurple600, gray100 } = vars;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
      flexDirection={'column'}
    >
      <img id="loader_logo" src={MinimalLogo} width="10%" />
      <LinearProgress
        variant="determinate"
        value={progress}
        color="inherit"
        sx={{
          borderRadius: 4,
          width: '240px',
          height: '8px',
          marginTop: '1.5rem',
          marginBottom: '1rem',
          '& .MuiLinearProgress-bar': {
            backgroundColor: primaryPurple600,
          },
          color: gray100,
          backgroundColor: gray100,
        }}
      />
      {text ? <div id="loader_text">{text}</div> : null}
    </Box>
  );
};

export default Loader;
