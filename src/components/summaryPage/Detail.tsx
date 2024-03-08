import {Box, Stack, Typography} from "@mui/material";
import {vars} from "../../theme/variables.ts";
const { gray500, gray700, gray600 } = vars;

export const Detail = ({ keyName, sectionData, value, labels }: any) => (
  <Stack
    key={keyName}
    direction="row"
    alignItems="center"
    justifyContent='space-between'
    spacing='1.5rem'
    id={keyName}
  >
    <Typography variant='h5' fontWeight={500} color={gray700}>{labels[keyName]}</Typography>
    <Stack spacing='.25rem'>
      <Typography variant='h5' fontWeight={400} width='23rem' textAlign='right' color={gray600}>{value}</Typography>
      {sectionData[`${keyName}_changes`] && <Typography variant='body1' width='23rem' textAlign='right' color={gray500}>
        +{sectionData[`${keyName}_changes`]} change (since last stats)
      </Typography>}
    </Stack>
  </Stack>
);
