import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Link,
  Typography,
  ButtonGroup,
  Stack,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { vars } from "../../../theme/variables.ts";
import {ArrowDown, ArrowUp, HelpCircle} from "../../../icons";

const { gray500} = vars

const Header = ({showDetails, setShowDetails}: {showDetails: boolean, setShowDetails: (showDetails: boolean) => void}) => {
  return (
    <Stack
      direction='row'
      sx={{
        alignItems:'center',
        justifyContent:'space-between',
        padding:'.75rem',
        borderBottom:'1px solid #E3E5E8',
        
        '& .MuiSvgIcon-root': {
          height: '1rem',
          width: '1rem'
        }
      }}
    >
      <Stack
        direction='row'
        alignItems='center'
        spacing='1rem'
      >
        <ButtonGroup variant="outlined" sx={{
          '& .MuiButtonBase-root': {
            width: '2rem',
            height: '2rem'
          }
        }}>
          <IconButton>
            <ArrowUp />
          </IconButton>
          <IconButton sx={{ marginLeft: '.25rem' }}>
            <ArrowDown />
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
        <HelpCircle />
      </Stack>
    </Stack>
  );
};

export default Header;
