// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Content as PDFMAKEContent } from 'pdfmake/interfaces';
import { KsRecord } from '../components/common/Types';
import { TypeB60Enum } from '../models/composer';
import { EntitiesJourneyType } from '../models/explorer';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { STRINGS_NUMBERS, DESTINATIONS_ORDER } from '../settings';
import { COMPOSER_VERSION, NEURONDM_VERSION } from '../settings';

const MAX_NUMBER_OF_COLUMNS_IN_CONNECTIVITY_MATRIX_TABLE = 30;

type pdfRequirementType = {
  connectionOrigin: string;
  numOfConnections: number;
  uniqueOrigins: string;
  uniqueDestinations: string;
  uniqueNerves: string;
  structureTraversed: string;
  uniqueSpecies: string;
  sexes: string;
  connectionTypes: string;
  endorgan: string;
  entitiesJourney: EntitiesJourneyType[];
  connectionDetails: ConnectionDetailType[];
};

type ConnectionDetailType = {
  'Statement Preview'?: string;
  'Connection Id'?: string;
  Species?: string;
  Sex?: string;
  Phenotype?: string;
  'Connectivity Model'?: string;
  Laterality?: string;
  'Circuit Type'?: string;
  References?: string;
  'Statement Alerts'?: string;
};

const convertEntitiesJourneyType = (
  entitiesJourney: ComposerEntitiesJourneyType[],
) => {
  const convertedEntitiesJourney: EntitiesJourneyType[] = [];
  for (const entityJourney of entitiesJourney) {
    const origins = entityJourney.origins.length
      ? entityJourney.origins.map((origin) => origin.label)
      : [];
    const vias = entityJourney.vias.length
      ? entityJourney.vias.map((via) => via.label)
      : [];
    const destinations = entityJourney.destinations.length
      ? entityJourney.destinations.map((destination) => destination.label)
      : [];
    convertedEntitiesJourney.push({ origins, vias, destinations });
  }
  return convertedEntitiesJourney;
};

export const getPDFContent = (
  pdfRequirement: pdfRequirementType,
): PDFMAKEContent => {
  const {
    connectionOrigin,
    numOfConnections,
    uniqueOrigins,
    uniqueDestinations,
    uniqueNerves,
    structureTraversed,
    uniqueSpecies,
    sexes,
    connectionTypes,
    endorgan,
    entitiesJourney,
    connectionDetails,
  } = pdfRequirement;
  const distinctNeuronPopulations = connectionDetails.length;
  // SECTION 1 - Result summary
  const resultSummary: PDFMAKEContent = [
    {
      text: `Query result summary for: ${connectionOrigin} -> ${endorgan}`,
      style: 'header',
      bold: true,
      fontSize: 18,
    },
    {
      text: 'Versions:',
      style: 'subheader',
      bold: true,
      margin: [0, 20, 0, 0],
      fontSize: 16,
    },
    {
      text: `SCKANNER Version: 1.0.0-beta`,
      style: 'paragraph',
      margin: [0, 10, 0, 0],
    },
    {
      text: `Composer Version: ${COMPOSER_VERSION}`,
      style: 'paragraph',
      margin: [0, 10, 0, 0],
    },
    {
      text: `SCKAN Version: ${NEURONDM_VERSION}`,
      style: 'paragraph',
      margin: [0, 10, 0, 0],
    },
    {
      text: 'Date: ' + new Date().toISOString(),
      style: 'paragraph',
      margin: [0, 10, 0, 0],
    },
    {
      text: 'Results summary:',
      bold: true,
      style: 'subheader',
      margin: [0, 20, 0, 0],
      fontSize: 16,
    },
    {
      text: `This information comes from ${numOfConnections} connections extracted from ${distinctNeuronPopulations} distinct neuron populations. `,
      style: 'paragraph',
      margin: [0, 15, 0, 0],
    },
  ];

  const summaryContentMap = {
    Origins: uniqueOrigins,
    Terminations: uniqueDestinations,
    Nerves: uniqueNerves,
    'Structure traversed': structureTraversed,
    'Identified Species': uniqueSpecies,
    'Sex Specific connections': sexes,
    'Conection types': connectionTypes,
    'Organ systems': endorgan,
  };

  for (const [key, value] of Object.entries(summaryContentMap)) {
    if (value) {
      resultSummary.push({
        text: [{ text: `${key}: `, bold: true }, { text: value }],
        margin: [0, 10, 0, 0],
      });
    }
  }

  // SECTION 2 - Connection details
  const connectionDetailsContent: PDFMAKEContent = [
    {
      text: 'Connection details for each distinct neuron population:',
      style: 'subheader',
      bold: true,
      margin: [0, 30, 0, 0],
      fontSize: 16,
    },
    {
      text: `${endorgan}`,
      bold: true,
      style: 'paragraph',
      decoration: 'underline',
      fontSize: 14,
      margin: [0, 15, 0, 0],
    },
  ];

  connectionDetails.map((detail) => {
    for (const [key, value] of Object.entries(detail)) {
      connectionDetailsContent.push({
        text: [{ text: `${key}`, bold: true }, { text: `: ${value}` }],
        margin: [0, 10, 0, 0],
      });
    }
    connectionDetailsContent.push({ text: '', margin: [0, 20, 0, 0] });
  });

  const sortEntitiesList = (entitiesList: string[]) => {
    const reorderedList: string[] = [];
    // first sort the entities based on the STRINGS_NUMBERS order
    const sortedEntities = entitiesList.sort((a, b) => {
      const aIndex = STRINGS_NUMBERS.indexOf(a.split(' ')[0].toLowerCase());
      const bIndex = STRINGS_NUMBERS.indexOf(b.split(' ')[0].toLowerCase());
      return aIndex - bIndex;
    });
    DESTINATIONS_ORDER.forEach((entity) => {
      sortedEntities.forEach((destination) => {
        if (
          destination.toLowerCase().includes(entity.toLowerCase()) &&
          !reorderedList.includes(destination)
        ) {
          reorderedList.push(destination);
        }
      });
    });
    // Add the remaning destinations
    sortedEntities.forEach((destination) => {
      if (!reorderedList.includes(destination)) {
        reorderedList.push(destination);
      }
    });
    return reorderedList;
  };

  // SECTION 3 - Connectivity Matrix - tables
  const rows = sortEntitiesList(uniqueOrigins.split(', '));
  const columns = sortEntitiesList(uniqueDestinations.split(', '));

  const matrix = rows.map((row) => {
    return columns.map((column) => {
      return entitiesJourney.flatMap((entity) => {
        return entity.flatMap((ent) => {
          if (ent.origins.includes(row) && ent.destinations.includes(column)) {
            return ent.vias;
          }
          return '';
        });
      });
    });
  });
  // add the rows as first row in the matrix and columns as the first column
  const columnsHeader = ['', ...columns];
  const rowsHeader = [...rows];
  // add columnsHeader and rowsHeder to the matrix
  const connectivityMatrix = matrix.map((row, index) => {
    return [rowsHeader[index], ...row];
  });
  connectivityMatrix.unshift(columnsHeader);

  const commonFirstColumn = connectivityMatrix.map((row) => row[0]);

  const splitMatrixIntoPages = (
    innerMatrix: number[][],
    maxColumns: number,
  ) => {
    const pages = [];
    for (let i = 0; i < innerMatrix[0].length; i += maxColumns) {
      const page = innerMatrix.map((row) => row.slice(i, i + maxColumns));
      pages.push(page);
    }

    // add the rowHeaer to rest of the pages
    pages.forEach((page, index) => {
      if (index > 0) {
        page.forEach((row, rowIndex) => {
          row.unshift(commonFirstColumn[rowIndex]);
        });
      }
    });
    return pages;
  };

  const connectivityMatrixPages = splitMatrixIntoPages(
    connectivityMatrix,
    MAX_NUMBER_OF_COLUMNS_IN_CONNECTIVITY_MATRIX_TABLE,
  );

  const connectivityMatrixContent: PDFMAKEContent = [
    {
      text: 'Connectivity Matrix',
      style: 'header',
      bold: true,
      fontSize: 18,
      margin: [0, 30, 0, 10],
    },
    {
      text: 'The connectivity matrix shows the route between the origin and destination end organ/destination.',
      style: 'subheader',
      bold: true,
      margin: [0, 0, 0, 10],
      fontSize: 14,
    },
  ];

  const numberOfConnectivityMatrixPages = connectivityMatrixPages.length;

  connectivityMatrixPages.forEach((cmPage, index) => {
    const marginTopForPageCountText = index > 0 ? 80 : 20;
    if (numberOfConnectivityMatrixPages > 1) {
      connectivityMatrixContent.push({
        text: `Page ${index + 1}/${numberOfConnectivityMatrixPages} of the connectivity matrix`,
        style: 'subheader',
        bold: true,
        fontSize: 13,
        margin: [0, marginTopForPageCountText, 0, 15],
      });
    }
    connectivityMatrixContent.push({
      text: `End organ → `,
      style: 'subheader',
      bold: true,
      margin: [80, 10, 0, 15],
    });

    connectivityMatrixContent.push({
      columns: [
        {
          stack: [
            {
              text: 'Origin',
              style: 'subheader',
              bold: true,
              margin: [0, 30, 10, 0],
              width: 40,
            },
            {
              text: '↓',
              style: 'subheader',
              alignment: 'center',
              bold: true,
              margin: [0, 10, 10, 0],
              width: 40,
            },
          ],
          width: 50,
        },
        {
          style: 'tableExample',
          table: {
            body: cmPage,
          },
          fontSize:
            cmPage[index].length > 13 ? 6 : cmPage[index].length > 6 ? 8 : 10,
        },
      ],
    });
  });

  const pdfContent = resultSummary
    .concat(connectionDetailsContent)
    .concat(connectivityMatrixContent);
  return pdfContent;
};

export const generatePDFService = (
  connectionOrigin: string = '',
  ksMap: KsRecord,
  connectionsCounter: number,
  endorgan: string = '',
  filteredKnowledgeStatements: KsRecord = {},
  majorNerves: Set<string>,
) => {
  const numOfConnections = connectionsCounter;
  const origins: string[] = [];
  const destinations: string[] = [];
  const nerves: string[] = [];
  const species: string[] = [];
  const sex: string[] = [];
  const phenotypes: string[] = [];
  const vias: string[] = [];
  for (const ks of Object.values(ksMap)) {
    origins.push(ks.origins.map((origin) => origin.name));
    destinations.push(
      ks.destinations.map((destination) =>
        destination.anatomical_entities.map((entity) => entity.name),
      ),
    );
    nerves.push(
      ks.vias.map((via) =>
        // NOTE: return the ones that exist in the majorNerves set
        via.anatomical_entities.map((entity) => {
          if (majorNerves.has(entity.id)) {
            return entity.name;
          }
          return;
        }),
      ),
    );
    species.push(ks.species.map((specie) => specie.name));
    sex.push(ks.sex.name);
    if (ks.phenotype.length) {
      phenotypes.push(ks.phenotype);
    }
    const localVia = ks.vias.filter((via) => via.type === TypeB60Enum.Axon);
    vias.push(
      localVia.map((via) =>
        via.anatomical_entities.map((entity) => entity.name),
      ),
    );
  }
  const uniqueOrigins = Array.from(new Set(origins.flat(2))).join(', ');
  const uniqueDestinations = Array.from(new Set(destinations.flat(2))).join(
    ', ',
  );
  const uniqueNerves = Array.from(
    new Set(nerves.flat(2).filter((n) => n !== undefined)),
  ).join(', ');
  const structureTraversed = Array.from(new Set(vias.flat(2))).join(', ');
  const uniqueSpecies = Array.from(new Set(species.flat(2))).join(', ');
  const sexes = Array.from(new Set(sex)).join(', ');
  const connectionTypes = Array.from(new Set(phenotypes)).join(', ');
  const entitiesJourney = [];

  const connectionDetails = filteredKnowledgeStatements
    ? Object.keys(filteredKnowledgeStatements).map((ksid) => {
        const ks = filteredKnowledgeStatements[ksid];
        const details: ConnectionDetailType = {
          'Statement Preview': ks.statement_preview || '-',
          'Connection Id': ks.id || '-',
          Species: ks.species.map((specie) => specie.name).join(', ') || '-',
          Sex: ks.sex.name || '-',
          Phenotype: ks.phenotype || '-',
          'Connectivity Model': ks.apinatomy || '-',
          Laterality: ks.laterality || '-',
          'Circuit Type': ks.circuit_type || '-',
          References:
            ks.provenances
              .filter((uri) => uri !== ks.id)
              .map((provenance) => provenance)
              .join(', ') || '-',
          'Statement Alerts':
            ks.statement_alerts && ks.statement_alerts.length > 0
              ? ks.statement_alerts
                  .map((alert) => `${alert.alert}: ${alert.text}`)
                  .join('; ')
              : '-',
        };
        Object.keys(details).forEach((key) => {
          if (details[key] === '-') {
            delete details[key];
          }
        });
        entitiesJourney.push(convertEntitiesJourneyType(ks.entities_journey));
        return details;
      })
    : [];

  const pdfContent = getPDFContent({
    connectionOrigin,
    numOfConnections,
    uniqueOrigins,
    uniqueDestinations,
    uniqueNerves,
    structureTraversed,
    uniqueSpecies,
    sexes,
    connectionTypes,
    endorgan,
    entitiesJourney,
    connectionDetails,
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A0',
    content: pdfContent,
    defaultStyle: {
      font: 'Asap',
    },
  };

  return docDefinition;
};
