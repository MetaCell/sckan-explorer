import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Typography,
  Stack,
} from '@mui/material';
import { vars } from '../../theme/variables.ts';
import { ArrowRight } from '../icons/index.tsx';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { SummaryType, KsRecord } from '../common/Types.ts';
import { useDataContext } from '../../context/DataContext.ts';
import { generatePDFService } from '../../services/pdfService.ts';
import pdfMake from 'pdfmake/build/pdfmake';

import {
  AsapFontBold,
  AsapFontBoldItalic,
  AsapFontItalic,
  AsapFontRegular,
} from '../../theme/AsapFontBase64.ts';
import { useWidgetStateActions } from '../../hooks/useWidgetStateActions.ts';

const { gray100, gray600A, gray500, primaryPurple600 } = vars;
pdfMake.vfs = {};

window.pdfMake.vfs['Asap-Regular.ttf'] = AsapFontRegular;
window.pdfMake.vfs['Asap-Bold.ttf'] = AsapFontBold;
window.pdfMake.vfs['Asap-Italic.ttf'] = AsapFontItalic;
window.pdfMake.vfs['Asap-BoldItalic.ttf'] = AsapFontBoldItalic;

pdfMake.fonts = {
  Asap: {
    normal: 'Asap-Regular.ttf',
    bold: 'Asap-Bold.ttf',
    italics: 'Asap-Italic.ttf',
    bolditalics: 'Asap-BoldItalic.ttf',
  },
};

type SummaryHeaderProps = {
  showDetails: SummaryType;
  setShowDetails: (showDetails: SummaryType) => void;
  knowledgeStatementsMap: KsRecord;
  connectionPage: number;
  setConnectionPage: (connectionPage: number) => void;
  totalConnectionCount: number;
  connectionsCounter: number;
};

const SummaryHeader = ({
  showDetails,
  setShowDetails,
  knowledgeStatementsMap,
  connectionPage,
  setConnectionPage,
  totalConnectionCount,
  connectionsCounter,
}: SummaryHeaderProps) => {
  const totalUniqueKS = Object.keys(knowledgeStatementsMap).length;
  const {
    selectedConnectionSummary,
    majorNerves,
  } = useDataContext();
  const { updateConnectionPageInWidgetState, goToConnectionView } = useWidgetStateActions();

  const handleUpClick = () => {
    if (connectionPage < totalUniqueKS) {
      const newConnectionPage = connectionPage + 1;
      setConnectionPage(newConnectionPage);
      updateConnectionPageInWidgetState(newConnectionPage);
    }
  };

  const handleDownClick = () => {
    if (connectionPage > 1) {
      const newConnectionPage = connectionPage - 1;
      setConnectionPage(newConnectionPage);
      updateConnectionPageInWidgetState(newConnectionPage);
    }
  };

  const generatePDF = () => {
    const pdfDefinition = generatePDFService(
      selectedConnectionSummary?.hierarchicalNode.name,
      selectedConnectionSummary?.connections || ({} as KsRecord),
      connectionsCounter,
      selectedConnectionSummary?.endOrgan?.name,
      selectedConnectionSummary?.filteredKnowledgeStatements ||
        ({} as KsRecord),
      majorNerves,
    );
    pdfMake.createPdf(pdfDefinition).download();
  };

  const handleBackToSummary = () => {
    setShowDetails(SummaryType.Summary);
    goToConnectionView({
      rightWidgetConnectionId: null,
      connectionPage: null,
    });
  };

  if (showDetails === SummaryType.Instruction) {
    return <></>;
  }

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `0.0625rem solid ${gray100}`,
        padding: '0.625rem 0.75rem 0.625rem 1.25rem',
        height: '3.938rem',

        '& .MuiSvgIcon-root': {
          height: '1.25rem',
          width: '1.25rem',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing="1rem">
        {showDetails === SummaryType.DetailedSummary && (
          <ButtonGroup
            variant="outlined"
            sx={{
              '& .MuiButtonBase-root': {
                width: '7.8rem',
                height: '2rem',
                borderRadius: '0.25rem',
                border: `0.0625rem solid ${primaryPurple600}`,
                color: primaryPurple600,
                marginRight: '1rem',
              },
            }}
          >
            <Button onClick={() => handleBackToSummary()}>
              Back to Summary
            </Button>
          </ButtonGroup>
        )}

        <Breadcrumbs separator={<ArrowRight />} aria-label="breadcrumb">
          {showDetails === SummaryType.DetailedSummary ? (
            <></>
          ) : (
            <Typography>Summary</Typography>
          )}
        </Breadcrumbs>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {showDetails === SummaryType.DetailedSummary ? (
          <ButtonGroup
            variant="outlined"
            sx={{
              '& .MuiButtonBase-root': {
                width: '4rem',
                height: '2rem',
                borderRadius: '0.25rem',
                border: `0.0625rem solid ${primaryPurple600}`,
                color: primaryPurple600,
                marginRight: '1rem',
              },
            }}
          >
            <Button
              sx={{
                width: '5rem !important',
                marginLeft: '.25rem',
              }}
              onClick={handleDownClick}
            >
              Previous
            </Button>
            <Typography
              variant="subtitle1"
              color={gray500}
              style={{ width: '12rem' }}
            >
              Displaying connection {connectionPage} of {totalUniqueKS}
            </Typography>
            <Button
              sx={{
                width: '5rem !important',
                marginLeft: '.25rem',
              }}
              onClick={handleUpClick}
            >
              Next
            </Button>
          </ButtonGroup>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  lineHeight: '1.25rem',
                  color: gray600A,
                }}
              >
                {totalConnectionCount} populations
              </Typography>

              <Divider
                sx={{
                  height: '2.25rem',
                  width: '0.0625rem',
                  background: gray100,
                }}
              />

              <Button variant="contained" onClick={generatePDF}>
                Results summary
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
};

export default SummaryHeader;
