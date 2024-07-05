import {
  AnatomicalEntity,
  BaseEntity,
  HierarchicalNode,
  KnowledgeStatement,
  Organ,
} from '../models/explorer';
import { Option } from '../components/common/Types.ts';
import { NerveResponse } from '../models/json.ts';
import { SYNONYMS_TITLE } from '../settings.ts';

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

export const getUniqueOrigins = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
  hierarchicalNodes: Record<string, HierarchicalNode>,
): Option[] => {
  let origins: AnatomicalEntity[] = [];
  Object.values(knowledgeStatements).forEach((ks) => {
    origins = origins.concat(ks.origins);
  });

  const nonLeafNames = getNonLeafNames(hierarchicalNodes);

  return getUniqueEntities([...origins, ...nonLeafNames]);
};

export const getUniqueVias = (
  knowledgeStatements: Record<string, KnowledgeStatement>,
  hierarchicalNodes: Record<string, HierarchicalNode>,
): Option[] => {
  let vias: AnatomicalEntity[] = [];
  Object.values(knowledgeStatements).forEach((ks) => {
    const anatomical_entities = ks.vias.flatMap(
      (via) => via.anatomical_entities,
    );
    vias = vias.concat(anatomical_entities);
  });

  const nonLeafNames = getNonLeafNames(hierarchicalNodes);

  return getUniqueEntities([...vias, ...nonLeafNames]);
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

export const getUniqueOrgans = (organs: Record<string, Organ>): Option[] => {
  return Object.values(organs).map((organ) => ({
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

const getNonLeafNames = (
  hierarchicalNodes: Record<string, HierarchicalNode>,
): BaseEntity[] => {
  return Object.values(hierarchicalNodes)
    .filter((node) => node.children && node.children.size > 0)
    .map((node) => ({
      id: node.id,
      name: node.name,
    }));
};
