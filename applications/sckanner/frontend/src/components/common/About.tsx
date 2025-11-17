import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MetaCellLogo from '../assets/svg/metacell-logo.svg';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import { FC } from 'react';
import { SCKANNER_VERSION } from '../../settings';
import { Datasnapshot } from '../../models/json';

interface ModalProps {
  open: boolean;
  handleClose: () => void;
  currentDatasnapshot?: Datasnapshot;
}

interface DetailsItemProps {
  heading: string;
  description: string | undefined;
  buttonText: string | undefined;
  buttonURL: string | undefined;
}

const DetailsUI: FC<DetailsItemProps> = ({
  heading,
  description = '',
  buttonText = '',
  buttonURL = '',
}) => (
  <Box>
    <Typography gutterBottom variant="h6">
      {heading}
    </Typography>
    {description && <Typography gutterBottom>{description}</Typography>}
    {buttonText && (
      <Typography
        variant="button"
        style={{ cursor: 'pointer' }}
        onClick={() => window.open(buttonURL, '_blank')?.focus()}
      >
        {buttonText}
      </Typography>
    )}
  </Box>
);

const About: FC<ModalProps> = ({ open, handleClose, currentDatasnapshot }) => {
  // Create AboutContent dynamically based on current datasnapshot
  const AboutContent = [
    {
      heading: 'About SCKANNER',
      description:
        'A key component of the SPARC Program is SCKAN. It is a semantic store housing a comprehensive knowledge base of autonomic nervous system (ANS) and peripheral nervous system (PNS) nerve to end organ connectivity. Connectivity information is derived from SPARC experts, SPARC data, literature and textbooks. SCKAN supports reasoning and offers powerful query and visualization capabilities.',
      buttonText: 'Learn more about SCKAN',
      buttonURL:
        'https://sparc.science/tools-and-resources/6eg3VpJbwQR4B84CjrvmyD',
    },
    {
      heading: 'Sckanner Documentation',
      buttonText: 'Click here for additional documentation and tutorials',
      buttonURL: 'https://docs.sparc.science/docs/sckanner',
    },
    {
      heading: 'Feedback form',
      buttonText: 'Provide your feedback using this form.',
      buttonURL: 'https://forms.gle/4YUjMa5Hx2KPzM8i6',
    },
    {
      heading: 'Owner',
      description: 'SPARC Knowledge Core (K-CORE)',
    },
    {
      heading: 'Funding Program',
      description: 'SPARC',
      buttonText: '',
    },
    {
      heading: 'Contact',
      buttonText: 'kcore@sparc.science',
      buttonURL: 'mailto:kcore@sparc.science',
    },
    {
      heading: 'SCKANNER Version',
      description: SCKANNER_VERSION,
    },
    // Add datasnapshot information if available
    ...(currentDatasnapshot
      ? [
          {
            heading:
              currentDatasnapshot.source.charAt(0).toUpperCase() +
              currentDatasnapshot.source.slice(1).toLowerCase(),
            description: `Version ${currentDatasnapshot.version}`,
          },
        ]
      : []),
  ];
  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle id="customized-dialog-title">About SCKANNER</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 10,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {AboutContent.map((content) => (
          <DetailsUI
            key={content?.heading}
            heading={content?.heading}
            description={content?.description}
            buttonText={content?.buttonText}
            buttonURL={content?.buttonURL}
          />
        ))}
        <Box className="MuiBoxMetacell-footer">
          <Typography>Powered by</Typography>
          <img src={MetaCellLogo} alt="logo" />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
export default About;
