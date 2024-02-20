import { useState } from 'react';
import {
  Box,
  Button,
} from "@mui/material";
import Details from "./common/connections/Details.tsx";
import Header from "./common/connections/Header.tsx";

const Connections = () => {
  const [showDetails, setShowDetails] = useState(false);
  const handleButtonClick = () => {
    setShowDetails(!showDetails);
  };
  
  return (
    <Box p={1}>
      <Header showDetails={showDetails} setShowDetails={setShowDetails} />
      {showDetails ?
        <Details />
        :
        <Button variant="contained" onClick={handleButtonClick}>
          Go to Summary
        </Button>
      }
    </Box>
  );
};

export default Connections;
