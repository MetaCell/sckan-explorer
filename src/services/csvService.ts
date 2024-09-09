// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { KnowledgeStatement } from '../models/explorer';

type csvData = {
  // declar a type where we have knowledge statements objects linked to a key, similar to a Map
  [key: string]: KnowledgeStatement;
};

export const generateCsvService = (data: csvData) => {
  const properties = [
    'id',
    'statement_preview',
    'provenances',
    'phenotype',
    'laterality',
    'projection',
    'circuit_type',
    'sex',
    'species',
    'apinatomy',
    'journey',
    'origins',
    'vias',
    'destinations',
  ];
  const keys = Object.keys(data);
  const rows = [properties];
  keys.forEach((key) => {
    const ks = data[key];
    const row = properties.map((property) => {
      if (property === 'origins') {
        const node = [] as string[];
        ks[property].forEach((origin) => {
          node.push(
            '[ URIs: ' +
              origin['ontology_uri'] +
              '; Label: ' +
              origin['name'] +
              ' ]',
          );
        });
        const toReturn = node
          .join(' & ')
          .replaceAll('\n', '. ')
          .replaceAll('\r', '')
          .replaceAll('\t', ' ')
          .replaceAll(',', ';');
        return toReturn;
      } else if (property === 'vias') {
        const node = [];
        ks[property].forEach((via) => {
          node.push(
            '[ (' +
              via['anatomical_entities']
                .map(
                  (e) => 'URI: ' + e['ontology_uri'] + '; Label: ' + e['name'],
                )
                .join(' & ') +
              '); Type: ' +
              via['type'] +
              '; From: ' +
              via['from_entities'].map((e) => e['ontology_uri']).join('; ') +
              ' ]',
          );
        });
        const toReturn = node
          .join(' & ')
          .replaceAll('\n', '. ')
          .replaceAll('\r', '')
          .replaceAll('\t', ' ')
          .replaceAll(',', ';');
        return toReturn;
      } else if (property === 'destinations') {
        const node = [];
        ks[property].forEach((dest) => {
          node.push(
            '[ (' +
              dest['anatomical_entities']
                .map(
                  (e) => 'URI: ' + e['ontology_uri'] + '; Label: ' + e['name'],
                )
                .join(' & ') +
              '); Type: ' +
              dest['type'] +
              '; From: ' +
              dest['from_entities'].map((e) => e['ontology_uri']).join('; ') +
              ' ]',
          );
        });
        const toReturn = node
          .join(' & ')
          .replaceAll('\n', '. ')
          .replaceAll('\r', '')
          .replaceAll('\t', ' ')
          .replaceAll(',', ';');
        return toReturn;
      } else if (property === 'sex') {
        if (ks[property].name && ks[property].ontology_uri) {
          return (
            '[ URI: ' +
            ks[property].ontology_uri +
            '; Label: ' +
            ks[property].name +
            ' ]'
          );
        } else {
          return '';
        }
      } else if (property === 'species') {
        if (ks[property].length) {
          return ks[property]
            .map((e) => '[ URI: ' + e.id + '; Label: ' + e.name + ' ]')
            .join(' & ');
        } else {
          return '';
        }
      } else if (Array.isArray(ks[property])) {
        // @ts-expect-error - TS doesn't know that ks[property] exists
        const toReturn = ks[property]
          .map((v) => '[ ' + v + ' ]')
          .join(' & ')
          .replaceAll('\n', '. ')
          .replaceAll('\r', '')
          .replaceAll('\t', ' ')
          .replaceAll(',', ';');
        return toReturn;
      } else {
        // @ts-expect-error - TS doesn't know that ks[property] exists
        const toReturn = ks[property]
          .replaceAll('\n', '. ')
          .replaceAll('\r', '')
          .replaceAll('\t', ' ')
          .replaceAll(',', ';');
        return toReturn;
      }
    });
    rows.push(row);
  });

  let csvData = '';
  rows.forEach((e) => {
    const toReturn = e
      .map(String)
      .map((v) => v.replaceAll('"', '""'))
      .map((v) => `"${v}"`)
      .join(',');
    csvData += toReturn + '\n';
  });
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8,' });
  return blob;
};


export const generateJourneyCsvService = (data: csvData, targetOrgan: string) => {
  const headers = [
    'ID',
    'Knowledge Statement',
    'Species',
    'Sex',
    'Origins (Names)',
    'Origins (IDs)',
    'Destinations (Names)',
    'Destinations (IDs)',
    'Journey',
    'Phenotype',
    'Laterality',
    'Forward Connections',
    'Synapses on',
    'Target Organ',
    'Provenances'
  ];

  const rows = [headers];

  Object.values(data).forEach((entry) => {
    entry.journey.forEach((journey) => {
      const row = [
        entry.id,
        entry.knowledge_statement,
        entry.species.map(s => s.name).join('; '),
        entry.sex.name,
        [...new Set(entry.origins.map(o => o.name))].join('; '),
        [...new Set(entry.origins.map(o => o.id))].join('; '),
        [...new Set(entry.destinations.flatMap(d => d.anatomical_entities.map(ae => ae.name)))].join('; '),
        [...new Set(entry.destinations.flatMap(d => d.anatomical_entities.map(ae => ae.id)))].join('; '),
        journey,
        entry.phenotype,
        entry.laterality,
        entry.forwardConnections.map(fc => fc.reference_uri).join('; '),
        _getCommonSynapsesOn(entry),
        targetOrgan,
        entry.provenances.join('; ')
      ];
      rows.push(row);
    });
  });

  let csvData = '';
  rows.forEach((row) => {
    const formattedRow = row
      .map(String)
      .map((v) => v.replaceAll('"', '""'))
      .map((v) => `"${v}"`)
      .join(',');
    csvData += formattedRow + '\n';
  });

  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8,' });
  return blob;
};


const _getCommonSynapsesOn = (entry: KnowledgeStatement) => {
  const destinationUris = new Set(entry.destinations.flatMap(d => d.anatomical_entities.map(ae => ae.ontology_uri)));
  const forwardConnectionUris = new Set(entry.forwardConnections.flatMap(fc => 
    fc.origins.map(origin => 
      origin.simple_entity?.ontology_uri || origin.region_layer?.ontology_uri
    )
  ).filter(uri => uri !== undefined));

  const commonUris = [...destinationUris].filter(uri => forwardConnectionUris.has(uri));
  
  const commonNames = entry.destinations
    .flatMap(d => d.anatomical_entities)
    .filter(ae => commonUris.includes(ae.ontology_uri))
    .map(ae => ae.name);
  
  return [...new Set(commonNames)].join('; ');
};