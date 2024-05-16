import { Box, Button, ButtonGroup, Divider, Typography, Stack, Link } from "@mui/material";
import { vars } from "../../theme/variables";
import IconButton from "@mui/material/IconButton";
import { ArrowDown, ArrowRight, ArrowUp, HelpCircle } from "../icons";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { SummaryType, ksMapType } from '../common/Types';

const { gray100, gray600A, gray500 } = vars;

const SummaryHeader = ({
   showDetails,
   setShowDetails,
  uniqueKS,
  connectionCount,
  setConnectionCount,
  totalConnectionCount
}: {
    showDetails: SummaryType,
    setShowDetails: (showDetails: SummaryType) => void,
    uniqueKS: ksMapType,
    connectionCount: number,
    setConnectionCount: (connectionCount: number) => void,
    totalConnectionCount: number
}) => {
  const totalUniqueKS = Object.keys(uniqueKS).length;

  function getConnectionId() {
    return Object.keys(uniqueKS)[connectionCount - 1] || ''
  }
  const connectionId = getConnectionId()

  const handleUpClick = () => {
    if (connectionCount < totalUniqueKS) {
      setConnectionCount(connectionCount + 1);
    }
  };
  
  const handleDownClick = () => {
    if (connectionCount > 1) {
      setConnectionCount(connectionCount - 1);
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
        {showDetails === 'detailedSummary' && <ButtonGroup variant="outlined" sx={{
          '& .MuiButtonBase-root': {
            width: '2rem',
            height: '2rem'
          }
        }}>
          <IconButton
            onClick={handleUpClick}>
            <ArrowUp />
          </IconButton>
          <IconButton sx={{
            marginLeft: '.25rem',
          }} onClick={handleDownClick}>
            <ArrowDown />
          </IconButton>
        </ButtonGroup>
        }
        
        <Breadcrumbs
          separator={<ArrowRight />}
          aria-label="breadcrumb"
        >
          {showDetails === 'detailedSummary' ? (
            <Link underline="hover" onClick={() => setShowDetails('summary')}>
              Summary
            </Link>
          ) : showDetails === 'summary' ? (
            <Typography>
              Summary
            </Typography>
            ) : <></>
          }
          {
            showDetails === 'detailedSummary' &&
              <Typography>
                {connectionId}
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
          showDetails === 'detailedSummary' ? (
            <>
              <Typography variant='subtitle1' color={gray500}>
                Displaying connection {connectionCount} of {totalUniqueKS}
              </Typography>
              <HelpCircle />
            </>
          ) : showDetails === 'summary' ? (
            <>
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

                  }}>{totalConnectionCount} connections</Typography>

                  <Divider sx={{
                    height: '2.25rem',
                    width: '0.0625rem',
                    background: gray100
                  }} />

                  <Button variant="contained">Download results (.csv)</Button>
                </Box>
              </>
            ) : <></>
        }
      </Box>
    </Stack>
  )
}

export default SummaryHeader;
