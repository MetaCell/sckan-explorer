// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Content as PDFMAKEContent } from 'pdfmake/interfaces';
import { KnowledgeStatement } from '../models/explorer';
import { KsRecord } from '../components/common/Types';
import { TypeB60Enum } from '../models/composer';

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
	connectionDetails: any[];
};


export const getPDFContent = (pdfRequirement: pdfRequirementType): PDFMAKEContent => {
	const { connectionOrigin, numOfConnections, uniqueOrigins, uniqueDestinations, uniqueNerves, structureTraversed, uniqueSpecies, sexes, connectionTypes, endorgan, connectionDetails } = pdfRequirement;
	let resultSummary: PDFMAKEContent = [
		{
			text: `Query result summary for: ${connectionOrigin} -> ${endorgan}`,
			style: 'header',
			bold: true,
			fontSize: 18
		},
		{
			text: 'Results summary:',
			bold: true,
			style: 'subheader',
			margin: [0, 20, 0, 0],
			fontSize: 16
		},
		{
			text: `This information comes from ${numOfConnections} connections. `,
			style: 'paragraph',
			margin: [0, 15, 0, 0]
		}
	];

	const summaryContentMap = {
		"Origins": uniqueOrigins,
		"Terminations": uniqueDestinations,
		"Nerves": uniqueNerves,
		"Structure traversed": structureTraversed,
		"Identified Species": uniqueSpecies,
		"Sex Specific connections": sexes,
		"Conection types": connectionTypes,
		"Organ systems": endorgan
	};

	for (const [key, value] of Object.entries(summaryContentMap)) {
		if (value) {
			resultSummary.push({
				text: [
					{ text: `${key}: `, bold: true },
					{ text: value }
				],
				margin: [0, 10, 0, 0]
			});
		}
	}

	let connectionDetailsContent: PDFMAKEContent = [
		{
			text: 'Connection details:',
			style: 'subheader',
			bold: true,
			margin: [0, 30, 0, 0],
			fontSize: 16
		},
		{
			text: `${endorgan}`,
			bold: true,
			style: 'paragraph',
			decoration: 'underline',
			fontSize: 14,
			margin: [0, 15, 0, 0]
		},
	];
	connectionDetails.map((detail) => {
		for (const [key, value] of Object.entries(detail)) {
			if (key === 'knowledgeStatement') {
				connectionDetailsContent.push({
					text: `${value}`,
					style: 'paragraph',
					margin: [0, 10, 0, 0]
				});
				continue;
			}
			connectionDetailsContent.push({
				text: [
					{ text: `${key}`, bold: true },
					{ text: `: ${value}` }
				],
				margin: [0, 10, 0, 0]
			});
		}
		connectionDetailsContent.push({ text: '', margin: [0, 20, 0, 0] });
	})
	const pdfContent = resultSummary.concat(connectionDetailsContent);
	return pdfContent;
};

export const generatePDFService = (
	connectionOrigin: string = '',
	ksMap: KsRecord,
	connectionsCounter: number,
	endorgan: string = '',
	filteredKnowledgeStatements: KsRecord = {}
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
		destinations.push(ks.destinations.map((destination) => destination.anatomical_entities.map((entity) => entity.name)));
		nerves.push(ks.vias.map((via) => via.anatomical_entities.map((entity) => entity.name)));
		species.push(ks.species.map((specie) => specie.name));
		sex.push(ks.sex.name);
		if (ks.phenotype.length) {
			phenotypes.push(ks.phenotype)
		}
		// vias - only those which are of type AXON are oart if structure traversed
		const localVia = ks.vias.filter((via) => via.type === TypeB60Enum.Axon);
		vias.push(localVia.map((via) => via.anatomical_entities.map((entity) => entity.name)));
	}
	const uniqueOrigins = Array.from(new Set(origins.flat(2))).join(", ");
	const uniqueDestinations = Array.from(new Set(destinations.flat(2))).join(", ");
	const uniqueNerves = Array.from(new Set(nerves.flat(2))).join(", ");
	const structureTraversed = Array.from(new Set(vias.flat(2))).join(", ");
	const uniqueSpecies = Array.from(new Set(species.flat(2))).join(", ");
	const sexes = Array.from(new Set(sex)).join(", ");
	const connectionTypes = phenotypes.join(", ");

	const connectionDetails = filteredKnowledgeStatements ? Object.keys(filteredKnowledgeStatements).map((ksid) => {
		const ks = filteredKnowledgeStatements[ksid];
		return {
			'knowledgeStatement': ks.knowledge_statement || '-',
			'Connection Id': ks.id || '-',
			'species': ks.species.map((specie) => specie.name).join(", ") || '-',
			'sex': ks.sex.name || '-',
			'phenotype': ks.phenotype || '-',
			'projection': ks.projection || '-',
			'references': ks.id || '-'
		};
	}) : [];


	return getPDFContent({
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
		connectionDetails
	});
};