import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MetaCellLogo from '../assets/svg/metacell-logo.svg';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

const About: React.FC<ModalProps> = ({
  open,
  handleClose,
}) => {

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle id="customized-dialog-title">
        About SCKAN Explorer
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 10,
        }}
      >
        <CloseIcon/>
      </IconButton>
      <DialogContent dividers>
        <Box>
          <Typography gutterBottom variant='h6'>About SCKAN Explorer</Typography>
          <Typography gutterBottom>
            A key component of the SPARC Program is SCKAN. It is a semantic store housing a comprehensive knowledge base of autonomic nervous system (ANS) and peripheral nervous system (PNS) nerve to end organ connectivity. Connectivity information is derived from SPARC experts, SPARC data, literature and textbooks. SCKAN supports reasoning and offers powerful query and visualization capabilities.
          </Typography>
          <Typography variant='button'>Learn more about SCKAN</Typography>
        </Box>
        <Box>
          <Typography gutterBottom variant='h6'>Owner</Typography>
          <Typography gutterBottom>
            SPARC Knowledge Core (K-CORE)
          </Typography>
          <Typography variant='button'>Learn more about SCKAN</Typography>
        </Box>
        <Box>
          <Typography gutterBottom variant='h6'>Funding Program</Typography>
          <Typography gutterBottom>
            SPARC
          </Typography>
        </Box>
        <Box>
          <Typography gutterBottom variant='h6'>Contact</Typography>
          <Typography variant='button'>kcore@sparc.science</Typography>
        </Box>
        <Box className="MuiBoxMetacell-footer">
          <Typography>Powered by</Typography>
          <img src={MetaCellLogo}/>
        </Box>
      </DialogContent>

    </Dialog>
  );
}
export default About;
