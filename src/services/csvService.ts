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
