import { Stack, Tooltip, Typography } from '@mui/material';
import { vars } from '../../theme/variables.ts';
import { HelpCircle } from '../icons/index.tsx';
import IconButton from '@mui/material/IconButton';
const { gray700, gray600 } = vars;

interface DetailProps {
  keyName: string;
  value: string | number;
  labels: string;
  index: number;
}
export const Detail = ({ keyName, value, labels, index }: DetailProps) => (
  <Stack
    key={keyName}
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    spacing="1.5rem"
    id={keyName}
  >
    <Typography
      variant="h5"
      fontWeight={500}
      color={gray700}
      sx={{
        '& .MuiSvgIcon-root': {
          fontSize: '1rem',
          marginLeft: '.5rem',
        },
        '& .MuiButtonBase-root': {
          padding: 0,

          '&:hover': {
            background: 'none',
          },
        },
      }}
    >
      {labels}
      {index === 0 && (
        <Tooltip title="This is a tooltip">
          <IconButton>
            <HelpCircle />
          </IconButton>
        </Tooltip>
      )}
    </Typography>
    <Stack spacing=".25rem">
      <Typography
        variant="h5"
        fontWeight={400}
        textAlign="right"
        color={gray600}
      >
        {value}
      </Typography>
      {/* {sectionData[`${keyName}_changes`] && (
        <Typography
          variant="body1"
          width="23rem"
          textAlign="right"
          color={gray500}
        >
          +{sectionData[`${keyName}_changes`]} change (since last stats)
        </Typography>
      )} */}
    </Stack>
  </Stack>
);
