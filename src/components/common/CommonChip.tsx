import React from 'react';
import Chip, { ChipProps } from '@mui/material/Chip';
import {vars} from "../../theme/variables.ts";

const { primarypurple500 } = vars

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
          color: primarypurple500
        }
      }}
    />
  );
};

export default CommonChip;
