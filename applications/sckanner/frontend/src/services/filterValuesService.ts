import {
  AnatomicalEntity,
  BaseEntity,
  KnowledgeStatement,
  Organ,
} from '../models/explorer.ts';
import { HierarchicalItem, Option } from '../components/common/Types.ts';
import { NerveResponse } from '../models/json.ts';
import { SYNONYMS_TITLE } from '../settings.ts';

const sortEntities = (entities: AnatomicalEntity[]): AnatomicalEntity[] => {
  return entities.sort((a, b) => a.name.localeCompare(b.name));
};

export const mapEntityToOption = (entities: BaseEntity[]): Option[] =>
  entities.map((entity) => {
    const option: Option = {
      id: entity.id,
      label: entity.name,
      group: '',
      content: [],
    };

    if (isAnatomicalEntity(entity) && entity.synonyms) {
      option.content.push({
        title: SYNONYMS_TITLE,
        value: entity.synonyms,
      });
    }

    return option;
  });

function isAnatomicalEntity(entity: BaseEntity): entity is AnatomicalEntity {
  return (entity as AnatomicalEntity).synonyms !== undefined;
}

const getUniqueEntities = (entities: BaseEntity[]): Option[] => {
  const uniqueMap = new Map<string, BaseEntity>();
  entities.forEach((entity) => {
    uniqueMap.set(entity.id, entity); // This ensures that each ID has only one entry
  });
  return mapEntityToOption(Array.from(uniqueMap.values()));
};

// Helper function to get the base ID from a compound ID
const getBaseId = (id: string): string => {
  // If the ID contains '#', take the part after the last '#'
  // This handles hierarchical IDs like "parent#child#grandchild"
  const parts = id.split('#');
  return parts[parts.length - 1];
};

// Helper function to recursively get all nodes (both leaf and parent nodes) without duplicates
const getAllNodes = (nodes: HierarchicalItem[]): BaseEntity[] => {
  const nodeMap = new Map<string, BaseEntity>();

  const traverse = (node: HierarchicalItem) => {
    // Get the base ID to normalize hierarchical IDs
    const baseId = getBaseId(node.id);

    // Add current node only if it's not already in the map (prevents duplicates)
    if (!nodeMap.has(baseId)) {
      nodeMap.set(baseId, {
        id: baseId,
        name: node.label,
      });
    }

    // If this node has children, traverse them
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  };

  nodes.forEach(traverse);
  return Array.from(nodeMap.values());
};

export const getUniqueOrigins = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
  filteredYAxis: HierarchicalItem[],
): Option[] => {
  let origins: AnatomicalEntity[] = [];
  Object.values(knowledgeStatements).forEach((ks) => {
    origins = origins.concat(ks.origins);
  });

  const sortedOrigins: AnatomicalEntity[] = sortEntities(origins);
  const uniqueYAxis = getAllNodes(filteredYAxis);

  const combinedEntities = [...sortedOrigins, ...uniqueYAxis];

  const result = getUniqueEntities(combinedEntities);

  return result;
};

export const getUniqueVias = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
): Option[] => {
  let vias: AnatomicalEntity[] = [];
  Object.values(knowledgeStatements).forEach((ks) => {
    const anatomical_entities = ks.vias.flatMap(
      (via) => via.anatomical_entities,
    );
    vias = vias.concat(anatomical_entities);
  });

  const sortedVias: AnatomicalEntity[] = sortEntities(vias);

  return getUniqueEntities([...sortedVias]);
};

export const getUniqueAllEntities = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
  filteredYAxis: HierarchicalItem[],
  filteredXOrgans: Organ[],
): Option[] => {
  let allEntities: AnatomicalEntity[] = [];
  Object.values(knowledgeStatements).forEach((ks) => {
    allEntities = allEntities.concat(ks.origins);
    allEntities = allEntities.concat(
      ks.vias.flatMap((via) => via.anatomical_entities),
    );
    allEntities = allEntities.concat(
      ks.destinations.flatMap((via) => via.anatomical_entities),
    );
  });

  const endOrganOptions: AnatomicalEntity[] = filteredXOrgans.map((organ) => ({
    id: organ.id,
    name: organ.name + ' (End Organ)',
    synonyms: '',
  }));

  allEntities = allEntities.concat(endOrganOptions);
  const sortedEntities: AnatomicalEntity[] = sortEntities(allEntities);
  const uniqueYAxis = getAllNodes(filteredYAxis);
  const combinedEntities = [...sortedEntities, ...uniqueYAxis];
  return getUniqueEntities(combinedEntities);
};

export const getUniqueSpecies = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
): Option[] => {
  let species: BaseEntity[] = [];
  Object.values(knowledgeStatements).forEach((ks) => {
    species = species.concat(ks.species);
  });
  return getUniqueEntities(species);
};

export const getUniqueOrgans = (filteredXOrgans: Organ[]): Option[] => {
  return filteredXOrgans.map((organ) => ({
    id: organ.id,
    label: organ.name,
    group: '',
    content: [],
  }));
};

function mapNameToOption(items: Set<string>) {
  return Array.from(items).map((item) => ({
    id: item,
    label: item,
    group: '',
    content: [],
  }));
}

export const getUniqueApinatomies = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
): Option[] => {
  const apinatomies = new Set<string>();
  Object.values(knowledgeStatements).forEach((ks) => {
    if (ks.apinatomy) {
      apinatomies.add(ks.apinatomy);
    }
  });
  return mapNameToOption(apinatomies);
};

export const getUniquePhenotypes = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
): Option[] => {
  const phenotypes = new Set<string>();
  Object.values(knowledgeStatements).forEach((ks) => {
    if (ks.phenotype) {
      phenotypes.add(ks.phenotype);
    }
  });
  return mapNameToOption(phenotypes);
};

export const getUniqueMajorNerves = (jsonData: NerveResponse) => {
  const nerves = new Set<string>();

  jsonData.results.bindings.forEach((binding) => {
    nerves.add(binding.Nerve_IRI.value);
  });

  return nerves;
};
