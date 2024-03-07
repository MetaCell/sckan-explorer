import {Box, Stack, Typography} from "@mui/material";
import {vars} from "../../theme/variables.ts";
import {labels} from "../../data/database_summary.json";
const { gray500, gray700, gray600 } = vars;

export const Detail = ({ keyName, sectionData, value }: any) => (
  <Stack
    key={keyName}
    direction="row"
    alignItems="center"
    justifyContent='space-between'
    spacing='1.5rem'
  >
    <Typography variant='h5' fontWeight={500} color={gray700}>{labels[keyName]}</Typography>
    <Box>
      <Typography variant='h5' fontWeight={400} width='23rem' textAlign='right' color={gray600}>{value}</Typography>
      {sectionData[`${keyName}_changes`] && <Typography variant='body1' width='23rem' textAlign='right' color={gray500}>{sectionData[`${keyName}_changes`]}</Typography>}
    </Box>
  </Stack>
);
