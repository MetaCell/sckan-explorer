import React, { FC } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import { vars } from '../../theme/variables.ts';
const { primaryPurple600, gray100 } = vars;

const errorColors = {
  red600: '#DC2626',
  red100: '#FEE2E2',
  red50: '#FEF2F2',
};

interface ErrorModalProps {
  open: boolean;
  handleClose: () => void;
  title?: string;
  message?: string;
  details?: string;
}

const ErrorModal: FC<ErrorModalProps> = ({
  open,
  handleClose,
  title = 'Error',
  message = 'An error occurred while loading data.',
  details,
}) => {
  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="error-dialog-title"
      open={open}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 9999 }}
    >
      <DialogTitle
        id="error-dialog-title"
        sx={{
          backgroundColor: errorColors.red50,
          color: primaryPurple600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ErrorIcon />
        {title}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 10,
          color: primaryPurple600,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        dividers
        sx={{
          backgroundColor: errorColors.red50,
        }}
      >
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" gutterBottom>
            {message}
          </Typography>
          {details && (
            <Box sx={{ mt: 5, mb: 5 }}>
              <Typography variant="subtitle2" gutterBottom>
                Details:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: gray100,
                  padding: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: errorColors.red600,
                }}
              >
                {details}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: errorColors.red50,
          padding: 2,
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            backgroundColor: primaryPurple600,
            '&:hover': {
              backgroundColor: primaryPurple600,
              opacity: 0.9,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorModal;
