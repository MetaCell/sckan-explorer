
import { HierarchicalItem, SubConnections, KsMapType } from "../components/common/Types.ts";
import { SummaryFilters } from "../context/DataContext.ts";
import { HierarchicalNode, KnowledgeStatement, Organ } from "../models/explorer.ts";
import { PhenotypeDetail } from "../components/common/Types.ts";
import { FIXED_FOUR_PHENOTYPE_COLORS_ARRAY, OTHER_PHENOTYPE_LABEL } from "../settings.ts";



export const generatePhenotypeColors = (num: number) => {
	const colors: string[] = FIXED_FOUR_PHENOTYPE_COLORS_ARRAY;
	for (let i = 4; i < num; i++) {
		colors.push(`rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`);
	}
	return colors;
}

export function convertViaToString(via: string[]): string {
	if (via.length === 0) return '-';
	if (via.length > 1) {
		return via.join(', ').replace(/,(?=[^,]*$)/, ' and');
	}
	return via[0];
}

export function getAllViasFromConnections(connections: KsMapType): { [key: string]: string } {
	const vias: { [key: string]: string } = {};
	Object.values(connections).forEach(connection => {
		if (connection.vias && connection.vias.length > 0) {
			const flattenedVias = connection.vias.flatMap(via => via.anatomical_entities);
			flattenedVias.forEach(via => {
				vias[via.id] = via.name;
			});
		}
	});
	return vias;
}

export function getAllPhenotypes(connections: KsMapType): string[] {
	const phenotypeNames: Set<string> = new Set();
	Object.values(connections)?.forEach(connection => {
		if (connection?.phenotype) {
			phenotypeNames.add(connection.phenotype);
		} else {
			phenotypeNames.add(OTHER_PHENOTYPE_LABEL);
		}
	});
	return Array.from(phenotypeNames)
}

export const getNerveFilters = (viasConnection: { [key: string]: string }, majorNerves: Set<string>) => {
	const nerves: { [key: string]: string } = {};
	Object.keys(viasConnection).forEach(via => {
		if (majorNerves.has(via)) {
			nerves[via] = viasConnection[via];
		}
	});
	return nerves;
}

export function getYAxisNode(node: HierarchicalItem, yAxisCon: HierarchicalNode): HierarchicalItem {
	if (node?.id === yAxisCon?.id) {
		return node;
	}
	if (node.children) {
		let found = false;
		for (const child of node.children) {
			if (found) break;
			const nodeFound = getYAxisNode(child, yAxisCon);
			if (nodeFound?.id) {
				found = true;
				return nodeFound;
			}
		}
	}

	return {} as HierarchicalItem;
}


export function getSecondaryHeatmapData(yAxis: HierarchicalItem[], connections: Map<string, SubConnections[]>) {
	const newData: SubConnections[][] = [];

	function addDataForItem(item: HierarchicalItem) {
		const itemData = connections.get(item.id);
		if (itemData) {
			newData.push(itemData);
		}
	}

	function traverseItems(items: HierarchicalItem[], fetchNextLevel: boolean) {
		items?.forEach(item => {
			if (item.expanded) {
				// Fetch data for the current expanded item
				addDataForItem(item);
				// Traverse further into the expanded item
				if (item.children && typeof item.children[0] !== 'string') {
					traverseItems(item.children as HierarchicalItem[], true);
				}
			} else if (fetchNextLevel) {
				// Fetch data for the immediate children of the last expanded item
				addDataForItem(item);
			}
		});
	}

	// Start traversal with the initial yAxis, allowing to fetch immediate children of the root if expanded
	traverseItems(yAxis, true);

	return newData;
}

export function summaryFilterKnowledgeStatements(knowledgeStatements: Record<string, KnowledgeStatement>, summaryFilters: SummaryFilters): Record<string, KnowledgeStatement> {
	const phenotypeIds = summaryFilters.Phenotype.map(option => option.id);
	const nerveIds = summaryFilters.Nerve.map(option => option.id);
	return Object.entries(knowledgeStatements).reduce((filtered, [id, ks]) => {
		const phenotypeMatch = !phenotypeIds.length || phenotypeIds.includes(ks.phenotype);
		const nerveMatch = !nerveIds.length || ks.vias?.some(via => via.anatomical_entities.map(entity => entity.id).some(id => nerveIds.includes(id)));
		if (phenotypeMatch && nerveMatch) {
			filtered[id] = ks;
		}
		return filtered;
	}, {} as Record<string, KnowledgeStatement>);
}

export function calculateSecondaryConnections(
	hierarchicalNodes: Record<string, HierarchicalNode>, endorgans: Record<string, Organ>,
	allKnowledgeStatements: Record<string, KnowledgeStatement>, summaryFilters: SummaryFilters,
	phenotypes: PhenotypeDetail[], hierarchyNode: HierarchicalNode
): Map<string, SubConnections[]> {

	// Apply filters to organs and knowledge statements
	const knowledgeStatements = summaryFilterKnowledgeStatements(allKnowledgeStatements, summaryFilters);

	const organIndexMap = Object.values(endorgans).reduce<Record<string, number>>((map, organ, index) => {
		map[organ.id] = index;
		return map;
	}, {});

	// Memoization map to store computed results for nodes
	const memo = new Map<string, SubConnections[]>();

	// Function to compute node connections with memoization
	function computeNodeConnections(nodeId: string): SubConnections[] {
		if (memo.has(nodeId)) {
			return memo.get(nodeId)!;
		}

		const node = hierarchicalNodes[nodeId];
		const result: SubConnections[] = Object.values(endorgans).map(() => ({ colors: [], ksIds: new Set<string>() }));
		if (node.children && node.children.size > 0) {
			node.children.forEach(childId => {
				const childConnections = computeNodeConnections(childId);
				childConnections.forEach((child, index) => {
					result[index].colors = [...new Set([...result[index].colors, ...child.colors])];
					result[index].ksIds = new Set([...result[index].ksIds, ...child.ksIds]);
				});
			});
		} else if (node.destinationDetails) {
			// Add the sub end organs to the connection details
			Object.keys(node.destinationDetails).forEach(endOrganIRI => {
				const index = organIndexMap[endOrganIRI];
				node.destinationDetails = node.destinationDetails || {}; // Keeps linter happy
				if (index !== undefined) {
					const knowledgeStatementIds = Array.from(node.destinationDetails[endOrganIRI])
						.filter(ksId => ksId in knowledgeStatements);

					if (knowledgeStatementIds.length > 0) {
						const ksPhenotypes = knowledgeStatementIds.map(ksId => knowledgeStatements[ksId].phenotype).filter(phenotype => phenotype !== '');
						const phenotypeColorsSet = new Set<string>();

						const unknownFilter = phenotypes.find(p => p.label === OTHER_PHENOTYPE_LABEL);
						ksPhenotypes.length === 0 ? phenotypeColorsSet.add(unknownFilter?.color || '') :
							ksPhenotypes.map(phenotype => {
								const phn = phenotypes.find(p => p.label === phenotype);
								phn ? phenotypeColorsSet.add(phn.color) : phenotypeColorsSet.add(unknownFilter?.color || '')  // FIXME: Could be a bug
							})

						const phenotypeColors = Array.from(phenotypeColorsSet)
						result[index].colors = phenotypeColors
						result[index].ksIds = new Set([...result[index].ksIds, ...knowledgeStatementIds]);
					}
				}
			});
		}

		memo.set(nodeId, result);
		return result;
	}

	computeNodeConnections(hierarchyNode.id)
	return memo;
}


export const getNormalizedValueForMinMax = (value: number, min: number, max: number): number => {
	// keep the min 0 always... 
	// Ex. for situations where min is 4... the value 4 will not be shown...
	min = 0;
	if (max === 0) return 0;
	return max !== min ? (value - min) / (max - min) : 1;
}

export function getXAxisForHeatmap(endorgan: Organ) {
	if (endorgan?.children) {
		return Array.from(endorgan.children.values()).map((endOrgan) => endOrgan.name);
	}
	return []
}