import React from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';
import {vars} from "../../theme/variables.ts";

const { primaryPurple500 } = vars

interface CommonChipProps extends ChipProps {}

const CommonChip: React.FC<CommonChipProps> = ({ label, variant = "outlined", icon, ...props }) => {
  return (
    <Chip
      label={label}
      variant={variant}
      icon={icon}
      {...props}
      sx={{
        '& .MuiSvgIcon-root': {
          order: 1,
          color: primaryPurple500
        }
      }}
    />
  );
};

export default CommonChip;
