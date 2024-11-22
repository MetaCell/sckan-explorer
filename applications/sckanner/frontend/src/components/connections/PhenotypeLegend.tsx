import { Box, Typography } from '@mui/material';
import { vars } from '../../theme/variables.ts';
import { useDataContext } from '../../context/DataContext.ts';

const { gray100 } = vars;

const PhenotypeLegend = ({ phenotypes }: { phenotypes: string[] }) => {
  const { phenotypesColorMap } = useDataContext();
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        padding: '0 1.5rem',
        background: '#fff',
      }}
    >
      <Box
        sx={{
          borderTop: `0.0625rem solid ${gray100}`,
          padding: '0.9375rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 500,
            lineHeight: '1.125rem',
            color: '#818898',
            paddingRight: '1.5rem',
          }}
        >
          Phenotype:
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          {phenotypes.map((phenotype: string) => (
            <Box
              sx={{
                p: '0.1875rem 0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
              key={phenotype}
            >
              <Box
                sx={{
                  width: '1.4794rem',
                  height: '1rem',
                  borderRadius: '0.125rem',
                  background: `${phenotypesColorMap[phenotype].color}`,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: '1.125rem',
                  color: '#4A4C4F',
                }}
              >
                {phenotype}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PhenotypeLegend;
