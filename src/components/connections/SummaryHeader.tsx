import { Box, Button, ButtonGroup, Divider, Typography, Stack, Link } from "@mui/material";
import { vars } from "../../theme/variables";
import IconButton from "@mui/material/IconButton";
import { ArrowDown, ArrowRight, ArrowUp, HelpCircle } from "../icons";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { SummaryType, KsMapType } from '../common/Types';

const { gray100, gray600A, gray500 } = vars;


type SummaryHeaderProps = {
  showDetails: SummaryType,
  setShowDetails: (showDetails: SummaryType) => void,
  knowledgeStatementsMap: KsMapType,
  connectionPage: number,
  setConnectionPage: (connectionPage: number) => void,
  totalConnectionCount: number
}


const SummaryHeader = ({
                           showDetails,
                           setShowDetails,
                           knowledgeStatementsMap,
                           connectionPage,
                           setConnectionPage,
                           totalConnectionCount
}: SummaryHeaderProps) => {
  const totalUniqueKS = Object.keys(knowledgeStatementsMap).length;

  function getConnectionId() {
    return Object.keys(knowledgeStatementsMap)[connectionPage - 1] || ''
  }
  const connectionId = getConnectionId()

  const handleUpClick = () => {
    if (connectionPage < totalUniqueKS) {
      setConnectionPage(connectionPage + 1);
    }
  };
  
  const handleDownClick = () => {
    if (connectionPage > 1) {
      setConnectionPage(connectionPage - 1);
    }
  };

    if (showDetails === SummaryType.Instruction) {
        return <></>
    }

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
                {showDetails === SummaryType.DetailedSummary && <ButtonGroup variant="outlined" sx={{
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
                    {showDetails === SummaryType.DetailedSummary ? (
                        <Link underline="hover" onClick={() => setShowDetails(SummaryType.Summary)}>
                            Summary
                        </Link>
                    ) : (
                        <Typography>
                            Summary
                        </Typography>
                    )
                    }
                    {
                        showDetails === SummaryType.DetailedSummary &&
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
                    showDetails === SummaryType.DetailedSummary ? (
                        <>
                            <Typography variant='subtitle1' color={gray500}>
                                Displaying connection {connectionPage} of {totalUniqueKS}
                            </Typography>
                            <HelpCircle />
                        </>
                    ) : (
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
                    )
                }
            </Box>
        </Stack>
    )
}

export default SummaryHeader;
