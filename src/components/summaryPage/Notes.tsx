import {Box, Typography} from "@mui/material";
import {vars} from "../../theme/variables.ts";
const { gray700, gray600 } = vars;

export const Notes = ({ text }: { text: string }) => (
  <Box>
    <Typography variant='h5' fontWeight={500} color={gray700}>Notes</Typography>
    <Typography variant='h5' fontWeight={400} color={gray600}>{text}</Typography>
  </Box>
);