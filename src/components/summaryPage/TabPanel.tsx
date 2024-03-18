import React from "react";
import {Box} from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      className="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          width: '50%'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
};
