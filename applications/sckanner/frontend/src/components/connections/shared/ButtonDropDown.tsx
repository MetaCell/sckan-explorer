import React, { useState } from 'react';
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Paper,
  Popper,
  MenuItem,
  MenuList,
  Box,
} from '@mui/material';
import { ArrowDropDown, ArrowOutward } from '@mui/icons-material';
import { KnowledgeStatement } from '../../../models/explorer';
import { vars } from '../../../theme/variables';

const { primaryPurple600 } = vars;

interface DropDownOption {
  label: string;
  value: string;
}

function generateOptions(
  connectionDetails: KnowledgeStatement,
): DropDownOption[] {
  const options: DropDownOption[] = [];
  if (connectionDetails?.species?.length > 0) {
    for (const species of connectionDetails.species) {
      const specieURI = species.id.split('/').pop()?.replace('_', ':');
      const popID = connectionDetails.id.replace(
        'http://uri.interlex.org/tgbugs/uris/readable/',
        'ilxtr:',
      );
      options.push({
        label: `View on MAPS for ${species?.name}`,
        value: `https://sparc.science/apps/maps?type=flatmap&taxo=${specieURI}&uberonid=${popID}`,
      });
    }
  }
  return options;
}

export default function MAPSButton({
  connectionDetails,
}: {
  connectionDetails: KnowledgeStatement;
}) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const options = generateOptions(connectionDetails);

  const handleClick = () => {
    // open a new tab with the selected option
    if (!options[selectedIndex]) return;
    window.open(options[selectedIndex]?.value, '_blank');
  };

  const handleMenuItemClick = (
    _event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  if (options.length === 0) {
    return null; // No options to display
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <ButtonGroup
        variant="outlined"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button
          sx={{
            '& .MuiButtonBase-root': {
              width: '7.8rem',
              borderRadius: '0.25rem',
              border: `0.0625rem solid ${primaryPurple600}`,
              color: primaryPurple600,
            },
          }}
          startIcon={<ArrowOutward />}
          variant="outlined"
          onClick={handleClick}
        >
          {options[selectedIndex]?.label}
        </Button>
        <Button
          size="small"
          aria-controls={open ? 'split-button-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-label="select action"
          aria-haspopup="menu"
          onClick={handleToggle}
          sx={{
            minWidth: '20px', // Reduced from 16px
            width: '20px', // Added explicit width
            // padding: '4px 0', // Reduced horizontal padding to 0
            '& .MuiSvgIcon-root': {
              fontSize: '16px', // Smaller icon
            },
          }}
        >
          <ArrowDropDown />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1000 }}
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        disablePortal
      >
        <Paper
          sx={{
            mt: 1,
            boxShadow:
              '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <MenuList id="split-button-menu">
              {options.map((option, index) => (
                <MenuItem
                  key={option.value}
                  selected={index === selectedIndex}
                  onClick={(event) => handleMenuItemClick(event, index)}
                >
                  {option.label}
                </MenuItem>
              ))}
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </Box>
  );
}
