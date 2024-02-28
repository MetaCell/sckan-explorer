import {
  Typography,
  Button,
  Stack,
  Divider
} from "@mui/material";
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { vars } from "../../../theme/variables.ts";
import PopulationDisplay from "./PopulationDisplay.tsx";
import CommonAccordion from "../Accordion.tsx";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import CommonChip from "../CommonChip.tsx";

const { gray500, gray700, gray400} = vars
const Details = () => {
  return (
    <Stack pl='1.5rem' pr='1.5rem' pt='.75rem' spacing='1.5rem'>
      <Stack direction='row' alignItems='center' justifyContent='space-between' mt='.75rem'>
        <Typography variant='h6'>
          Details
        </Typography>
        <Stack direction='row' alignItems='center' spacing='.5rem'>
          <Button variant="outlined" startIcon={<ArrowOutwardRoundedIcon />}>
            View on SPARC Portal
          </Button>
          <Button variant="contained">
            Download (.pdf)
          </Button>
        </Stack>
      </Stack>
      <Stack mt='1.75rem' spacing='.5rem'>
        <Typography variant='subtitle2' color={gray700}>
          Knowledge statement
        </Typography>
        <Typography variant='body1' color={gray500}>
          Fifth thoracic dorsal root ganglion to Heart right ventricle via White matter of spinal cord
        </Typography>
        <CommonChip label="Sympathetic" variant="outlined" />
       <CommonAccordion
         summary="Connection Details"
         details={
           <>
             <Stack spacing={1}>
               <Stack
                 direction="row"
                 alignItems="center"
                 spacing={6}
               >
                 <Typography variant='subtitle1' width='6rem'>Status</Typography>
                 <Typography variant='subtitle1' fontWeight={400} display='flex' alignItems='center' gap='.5rem'>
                   Inferred
                   <HelpOutlineRoundedIcon fontSize='small' sx={{ color: gray400}} />
                 </Typography>
               </Stack>
               <Stack
                 direction="row"
                 alignItems="center"
                 spacing={6}
               >
                 <Typography variant='subtitle1' width='6rem'>Species</Typography>
                 <Typography variant='subtitle1' fontWeight={400}>Mammal</Typography>
               </Stack>
               <Stack
                 direction="row"
                 alignItems="center"
                 spacing={6}
               >
                 <Typography variant='subtitle1' width='6rem'>Label</Typography>
                 <Typography variant='subtitle1' fontWeight={400}>Neuron type aacar 13</Typography>
               </Stack>
               <Stack
                 direction="row"
                 alignItems="center"
                 spacing={6}
               >
                 <Typography variant='subtitle1' width='6rem'>Provenances</Typography>
                 <Stack
                   direction="row"
                   alignItems="center"
                   spacing={'.5rem'}
                 >
                   <CommonChip label="www.microsoft.com" variant="outlined" className='link' icon={<ArrowOutwardRoundedIcon fontSize='small' />} />
                   <CommonChip label="google.com" variant="outlined" className='link' icon={<ArrowOutwardRoundedIcon fontSize='small' />} />
                 </Stack>
               </Stack>
             </Stack>
           </>
         }
       />
      </Stack>
      <Divider />
      <PopulationDisplay />
    </Stack>
  );
};

export default Details;