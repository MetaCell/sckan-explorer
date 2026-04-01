import { Stack, Tooltip, Typography } from '@mui/material';
import { vars } from '../../theme/variables.ts';
import { HelpCircle } from '../icons/index.tsx';
import IconButton from '@mui/material/IconButton';
const { gray700, gray600, gray500 } = vars;

interface DetailProps {
  keyName: string;
  value: string | number;
  labels: string;
  index: number;
  change?: number;
}
export const Detail = ({
  keyName,
  value,
  labels,
  index,
  change,
}: DetailProps) => (
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
        {change != null && change !== 0 && (
          <Typography
            component="span"
            variant="h5"
            fontWeight={400}
            color={gray500}
            sx={{ marginLeft: '.25rem' }}
          >
            ({change > 0 ? `+${change}` : change})
          </Typography>
        )}
      </Typography>
    </Stack>
  </Stack>
);
