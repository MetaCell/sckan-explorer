import { Stack, Typography } from '@mui/material';
import { sckanInfoText } from '../../data/database_summary_info.ts';
import { vars } from '../../theme/variables.ts';
const { gray600 } = vars;

const InfoTab = () => (
  <Stack p="2rem" spacing="3rem">
    <Stack spacing=".75rem">
      <Typography variant="h2">{sckanInfoText.summary.title}</Typography>
      <Typography
        variant="h5"
        fontWeight={400}
        color={gray600}
        fontSize="0.875rem"
        lineHeight="1.25rem"
      >
        {sckanInfoText.summary.content}
      </Typography>
    </Stack>
    <Stack spacing=".75rem">
      <Typography variant="h2">
        {sckanInfoText.connectivityStats.title}
      </Typography>
      <Typography
        variant="h5"
        fontWeight={400}
        color={gray600}
        fontSize="0.875rem"
        lineHeight="1.25rem"
      >
        {sckanInfoText.connectivityStats.content}
      </Typography>
      <ul
        style={{
          paddingLeft: '1.5rem',
          fontSize: '.875rem',
          fontWeight: 400,
          lineHeight: '1.25rem',
          color: gray600,
        }}
      >
        {sckanInfoText.connectivityStats.bulletPoints.map(
          (bulletPoint, index) => (
            <li key={index}>{bulletPoint}</li>
          ),
        )}
      </ul>
      <Typography
        variant="h5"
        fontWeight={400}
        color={gray600}
        fontSize=".875rem"
        lineHeight="1.25rem"
      >
        {sckanInfoText.connectivityStats.note}
      </Typography>
    </Stack>
  </Stack>
);

export default InfoTab;
