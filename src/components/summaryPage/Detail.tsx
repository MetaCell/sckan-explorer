import {Box, Stack, Typography} from "@mui/material";
import {vars} from "../../theme/variables.ts";
const { gray500, gray700, gray600 } = vars;

export const Detail = ({ label, value, note }: { label: string; value: string | number; note?: string | number }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent='space-between'
    spacing='1.5rem'
  >
    <Typography variant='h5' fontWeight={500} color={gray700}>{label}</Typography>
    <Box>
      <Typography variant='h5' fontWeight={400} width='23rem' textAlign='right' color={gray600}>{value}</Typography>
      {note && <Typography variant='body1' width='23rem' textAlign='right' color={gray500}>{note}</Typography>}
    </Box>
  </Stack>
);
