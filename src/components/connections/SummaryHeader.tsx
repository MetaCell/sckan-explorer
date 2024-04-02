import { useState } from 'react';
import { Box, Button, ButtonGroup, Divider, Typography, Stack, Link } from "@mui/material";
import { vars } from "../../theme/variables";
import IconButton from "@mui/material/IconButton";
import { ArrowDown, ArrowRight, ArrowUp, HelpCircle } from "../icons";
import Breadcrumbs from "@mui/material/Breadcrumbs";

const { gray100, primaryPurple600, gray600A, gray500 } = vars;

const SummaryHeader = ({
   showDetails,
   setShowDetails,
   numOfConnections,
   connection
  }: {
  showDetails: boolean,
  setShowDetails: (showDetails: boolean) => void,
  numOfConnections: number,
  connection: string
}) => {
  const [connectionCount, setConnectionCount] = useState(1);
  
  const handleUpClick = () => {
    if (connectionCount < numOfConnections) {
      setConnectionCount(prevCount => prevCount + 1);
    }
  };
  
  const handleDownClick = () => {
    if (connectionCount > 1) {
      setConnectionCount(prevCount => prevCount - 1);
    }
  };
  
  return (
    <Stack
      direction='row'
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `0.0625rem solid ${gray100}`,
        padding: '0.625rem 0.75rem 0.625rem 1.25rem',
        height: '3.938rem',
        
        '& .MuiSvgIcon-root': {
          height: '1.25rem',
          width: '1.25rem'
        }
      }}
    >
      <Stack
        direction='row'
        alignItems='center'
        spacing='1rem'
      >
        {showDetails && <ButtonGroup variant="outlined" sx={{
          '& .MuiButtonBase-root': {
            width: '2rem',
            height: '2rem'
          }
        }}>
            <IconButton onClick={handleUpClick}>
                <ArrowUp />
            </IconButton>
            <IconButton sx={{ marginLeft: '.25rem' }} onClick={handleDownClick}>
                <ArrowDown />
            </IconButton>
        </ButtonGroup>
        }
        
        <Breadcrumbs
          separator={<ArrowRight />}
          aria-label="breadcrumb"
        >
          {showDetails ?
            <Link underline="hover" onClick={() => setShowDetails(false)}>
              Summary
            </Link> :
            <Typography>
              Summary
            </Typography>
          }
          {
            showDetails &&
              <Typography>
                {connection}
              </Typography>
          }
        </Breadcrumbs>
      </Stack>
      
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        {
          showDetails ?
            <>
              <Typography variant='subtitle1' color={gray500}>
                Displaying connection {connectionCount} of {numOfConnections}
              </Typography>
              <HelpCircle />
            </> :
            <>
          <Typography sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '1.25rem',
              color: primaryPurple600
          }}>Summary</Typography>

          <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
          }}>
              <Typography sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: '1.25rem',
                color: gray600A
                
              }}>{numOfConnections} connections</Typography>
              
              <Divider sx={{
                height: '2.25rem',
                width: '0.0625rem',
                background: gray100
              }} />
              
              <Button variant="contained">Download results (.csv)</Button>
              </Box>
            </>
        }
      </Box>
    </Stack>
  )
}

export default SummaryHeader;
