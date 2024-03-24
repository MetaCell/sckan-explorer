import { Stack, Typography} from "@mui/material";
import {vars} from "../../theme/variables.ts";
import {HelpCircle} from "../../icons";
const { gray500, gray700, gray600 } = vars;

interface SectionDataType {
  [key: string]: string | number;
}

type LabelsType = {
  [key: string]: string;
};

interface DetailProps {
  keyName: string, sectionData: SectionDataType, value: string | number, labels: LabelsType
}
export const Detail = ({ keyName, sectionData, value, labels } : DetailProps) => (
  <Stack
    key={keyName}
    direction="row"
    alignItems="center"
    justifyContent='space-between'
    spacing='1.5rem'
    id={keyName}
  >
    <Stack direction="row" spacing='.5rem'>
      <Typography variant='h5' fontWeight={500} color={gray700}>{labels[keyName]}</Typography>
      <HelpCircle />
    </Stack>
    <Stack spacing='.25rem'>
      <Typography variant='h5' fontWeight={400} width='23rem' textAlign='right' color={gray600}>{value}</Typography>
      {sectionData[`${keyName}_changes`] && <Typography variant='body1' width='23rem' textAlign='right' color={gray500}>
        +{sectionData[`${keyName}_changes`]} change (since last stats)
      </Typography>}
    </Stack>
  </Stack>
);
