import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Link,
  Typography,
  ButtonGroup,
  Stack,
} from "@mui/material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import IconButton from "@mui/material/IconButton";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { vars } from "../../../theme/variables.ts";

const { gray500, gray400} = vars

const Header = ({showDetails, setShowDetails}: {showDetails: boolean, setShowDetails: (showDetails: boolean) => void}) => {
  return (
    <Stack
      direction='row'
      alignItems='center'
      justifyContent='space-between'
      padding='.75rem'
      borderBottom='1px solid #E3E5E8'
    >
      <Stack
        direction='row'
        alignItems='center'
        spacing='1rem'
      >
        <ButtonGroup variant="outlined">
          <IconButton>
            <KeyboardArrowUpRoundedIcon />
          </IconButton>
          <IconButton sx={{ marginLeft: '8px' }}>
            <KeyboardArrowDownRoundedIcon />
          </IconButton>
        </ButtonGroup>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link underline="hover" onClick={() => setShowDetails(false)}>
            Summary
          </Link>
          {
            showDetails &&
              <Typography>
                  ilxtr:neuron-type-aacar-11
              </Typography>
          }
        </Breadcrumbs>
      </Stack>
      
      <Stack direction='row' alignItems='center' spacing='.5rem'>
        <Typography variant='subtitle1' color={gray500}>
          Displaying connection 1 of 5
        </Typography>
        <HelpOutlineRoundedIcon fontSize='small' sx={{ color: gray400}} />
      </Stack>
    </Stack>
  );
};

export default Header;
