// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Content as PDFMAKEContent } from 'pdfmake/interfaces';
import { KsRecord } from '../components/common/Types';
import { TypeB60Enum } from '../models/composer';
import { EntitiesJourneyType } from '../models/explorer';
import { TDocumentDefinitions } from 'pdfmake/interfaces';

const COLUMN_COUNT_AFTER_TO_REMOVE_NULL_VALUES_IN_COLUMNS = 6;

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
  'Knowledge Statement'?: string;
  'Connection Id'?: string;
  Species?: string;
  Sex?: string;
  Phenotype?: string;
  Projection?: string;
  'Connectivity Model'?: string;
  Laterality?: string;
  'Circuit Type'?: string;
  References?: string;
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
  // SECTION 1 - Result summary
  const resultSummary: PDFMAKEContent = [
    {
      text: `Query result summary for: ${connectionOrigin} -> ${endorgan}`,
      style: 'header',
      bold: true,
      fontSize: 18,
    },
    {
      text: 'Results summary:',
      bold: true,
      style: 'subheader',
      margin: [0, 20, 0, 0],
      fontSize: 16,
    },
    {
      text: `This information comes from ${numOfConnections} connections. `,
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
      text: 'Connection details:',
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
      if (key === 'Knowledge Statement') {
        connectionDetailsContent.push({
          text: `${value}`,
          style: 'paragraph',
          margin: [0, 10, 0, 0],
        });
        continue;
      }
      connectionDetailsContent.push({
        text: [{ text: `${key}`, bold: true }, { text: `: ${value}` }],
        margin: [0, 10, 0, 0],
      });
    }
    connectionDetailsContent.push({ text: '', margin: [0, 20, 0, 0] });
  });

  // SECTION 3 - Connectivity Matrix - tables
  const row = connectionOrigin;
  const columns = uniqueDestinations.split(', ');

  // second row - is for the vias between the origin and the respective target organs
  const emptyColumns = [];
  const viasRow = columns.map((column, index) => {
    const connectionDetail = entitiesJourney.flatMap((entity) => {
      return entity.flatMap((ent) => {
        if (ent.destinations.includes(column)) {
          return ent.vias;
        }
        return [];
      });
    });
    if (connectionDetail.length !== 0) {
      return Array.from(new Set(connectionDetail)).join(', ');
    }
    emptyColumns.push(index);
    return null;
  });
  // remove the columns with the null values - to make the pdf more readable.
  const filteredViasRow =
    columns.length > COLUMN_COUNT_AFTER_TO_REMOVE_NULL_VALUES_IN_COLUMNS
      ? viasRow.filter((v) => v !== null)
      : viasRow;
  const filteredColumns =
    columns.length > COLUMN_COUNT_AFTER_TO_REMOVE_NULL_VALUES_IN_COLUMNS
      ? columns.filter((_, index) => !emptyColumns.includes(index))
      : columns;

  const connectivityMatrixHeader = ['Structure', ...filteredColumns];
  const connectivityMatrixContent: PDFMAKEContent = [
    {
      text: 'Connectivity Matrix',
      style: 'header',
      bold: true,
      fontSize: 18,
      margin: [0, 30, 0, 10],
    },
    {
      style: 'tableExample',
      table: {
        body: [connectivityMatrixHeader, [row, ...filteredViasRow]],
      },
      fontSize:
        filteredColumns.length > 13 ? 6 : filteredColumns.length > 6 ? 8 : 10,
    },
  ];

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
  const connectionTypes = phenotypes.join(', ');
  const entitiesJourney = [];

  const connectionDetails = filteredKnowledgeStatements
    ? Object.keys(filteredKnowledgeStatements).map((ksid) => {
        const ks = filteredKnowledgeStatements[ksid];
        const details: ConnectionDetailType = {
          'Knowledge Statement': ks.knowledge_statement || '-',
          'Connection Id': ks.id || '-',
          Species: ks.species.map((specie) => specie.name).join(', ') || '-',
          Sex: ks.sex.name || '-',
          Phenotype: ks.phenotype || '-',
          Projection: ks.projection || '-',
          'Connectivity Model': ks.apinatomy || '-',
          Laterality: ks.laterality || '-',
          'Circuit Type': ks.circuit_type || '-',
          References:
            ks.provenances.map((provenance) => provenance).join(', ') || '-',
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
    pageSize: 'A4',
    content: pdfContent,
    defaultStyle: {
      font: 'Asap',
    },
  };

  return docDefinition;
};
