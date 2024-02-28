import { Box, Chip, TextField, Typography } from "@mui/material";
import { ArrowRightIcon } from "./icons";
import { vars } from "../theme/variables";
import SummaryHeader from "./connections/SummaryHeader";

const { gray700, gray600A, gray100 } = vars;

const styles = {
    heading: {
        fontSize: '0.875rem',
        fontWeight: '500',
        lineHeight: '1.25rem',
        color: gray700,
        marginBottom: '0.5rem'
    },
    text: {
        fontSize: '0.875rem',
        fontWeight: 400,
        lineHeight: '1.25rem',
        color: gray600A
    }
}

type PhenotypeDetail = {
    label: string;
    color: string;
};
const phenotype: PhenotypeDetail[] = [
    {
        label: 'Sympathetic',
        color: '#9B18D8'
    },
    {
        label: 'Parasympathetic',
        color: '#2C2CCE'
    },
    {
        label: 'Sensory',
        color: '#DC6803'
    },
    {
        label: 'Motor',
        color: '#EAAA08'
    }
]

function Connections() {
    return (
        <Box display='flex' flexDirection='column' minHeight={1}>
            <SummaryHeader />

            <Box p={3} display='flex' flexDirection='column' gap={3}>
                <Box display='flex' alignItems='flex-end' gap={1.5}>
                    <Box flex={1}>
                        <Typography sx={{...styles.heading, marginBottom: '0.75rem'}}>Connection origin</Typography>
                        <TextField value='Thoracic' fullWidth />
                    </Box>
                    <ArrowRightIcon />
                    <Box flex={1}>
                        <Typography sx={{...styles.heading, marginBottom: '0.75rem'}}>End Organ</Typography>
                        <TextField value='Heart' fullWidth />
                    </Box>
                </Box>

                <Box>
                    <Typography sx={styles.heading}>Amount of connections</Typography>
                    <Chip label="23 connections" variant="outlined" color="primary" />
                </Box>

                <Box>
                    <Typography sx={styles.heading}>Connections are through these nerves</Typography>
                    <Typography sx={styles.text}>Pudendal, vagus and splanchnic</Typography>
                </Box>
            </Box>

            <Box flex={1} p={3} sx={{
                borderTop: `0.0625rem solid ${gray100}`,
            }}>
                <Box>
                    <Typography sx={styles.heading}>Summary map</Typography>
                    <Typography sx={styles.text}>
                        Summary map shows the connections of the selected connection origin and end organ with phenotypes. Select individual squares to view the details of each connections.
                    </Typography>
                </Box>
            </Box>

            <Box sx={{
                position: 'sticky',
                bottom: 0,
                padding: '0 24px',
                background: '#fff'
            }}>
                <Box sx={{
                    borderTop: `0.0625rem solid ${gray100}`,
                    padding: '18px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography sx={{
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '18px',
                        color: '#818898'
                    }}>Phenotype</Typography>
                    
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '24px'
                    }}>
                        {phenotype.map((type: PhenotypeDetail) => (
                            <Box sx={{
                                p: '3px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <Box sx={{
                                    width: '23.67px',
                                    height: '16px',
                                    borderRadius: '2px',
                                    background: type.color
                                }} />
                                <Typography sx={{
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    lineHeight: '18px',
                                    color: '#4A4C4F'
                                }}>{type.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Connections
