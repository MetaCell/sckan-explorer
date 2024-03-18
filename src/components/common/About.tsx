import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MetaCellLogo from '../assets/svg/metacell-logo.svg';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import {FC} from "react";

interface ModalProps {
  open: boolean;
  handleClose: () => void;
}

interface DetailsItemProps {
  heading: string;
  description: string;
  buttonText: string;
}

const DetailsUI: FC<DetailsItemProps> = ({heading, description = '', buttonText = ''}) => (
  <Box>
    <Typography gutterBottom variant='h6'>{heading}</Typography>
    {description && <Typography gutterBottom>
      {description}
    </Typography> }
    {buttonText && <Typography variant='button'>{buttonText}</Typography>}
  </Box>
)

const AboutContent = [
  {
    heading: 'About SCKAN Explorer',
    description: 'A key component of the SPARC Program is SCKAN. It is a semantic store housing a comprehensive knowledge base of autonomic nervous system (ANS) and peripheral nervous system (PNS) nerve to end organ connectivity. Connectivity information is derived from SPARC experts, SPARC data, literature and textbooks. SCKAN supports reasoning and offers powerful query and visualization capabilities.',
    buttonText: 'Learn more about SCKAN'
  },
  {
    heading: 'Owner',
    description: 'SPARC Knowledge Core (K-CORE)',
    buttonText: 'Learn more about SCKAN'
  },
  {
    heading: 'Funding Program',
    description: 'SPARC',
    buttonText: ''
  },
  {
    heading: 'Contact',
    buttonText: 'kcore@sparc.science',
    description: '',
  },

]

const About: FC<ModalProps> = ({
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
        { AboutContent.map((content) => <DetailsUI key={content?.heading} heading={content?.heading} description={content?.description} buttonText={content?.buttonText} /> )}
        <Box className="MuiBoxMetacell-footer">
          <Typography>Powered by</Typography>
          <img src={MetaCellLogo} alt='logo'/>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
export default About;
