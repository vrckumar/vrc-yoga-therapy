import manifest from './manifest.json';
import ailmentsUrl from './ailments.ndjson?url';
import conditionsUrl from './conditions.ndjson?url';
import goalsUrl from './goals.ndjson?url';
import itemAilmentMapsUrl from './item_ailment_maps.ndjson?url';
import itemAliasesUrl from './item_aliases.ndjson?url';
import itemConditionMapsUrl from './item_condition_maps.ndjson?url';
import itemGoalMapsUrl from './item_goal_maps.ndjson?url';
import itemKoshaMapsUrl from './item_kosha_maps.ndjson?url';
import itemSectionMapsUrl from './item_section_maps.ndjson?url';
import koshasUrl from './koshas.ndjson?url';
import lifestylesUrl from './lifestyles.ndjson?url';
import mediaAssetsUrl from './media_assets.ndjson?url';
import postureTypesUrl from './posture_types.ndjson?url';
import practiceCategoriesUrl from './practice_categories.ndjson?url';
import practiceSubtypesUrl from './practice_subtypes.ndjson?url';
import practicesUrl from './practices.ndjson?url';
import protocolItemsUrl from './protocol_items.ndjson?url';
import protocolsUrl from './protocols.ndjson?url';
import sectionsUrl from './sections.ndjson?url';

export const knowledgeManifest = manifest;

const TABLE_URLS = Object.freeze({
  ailments: ailmentsUrl,
  conditions: conditionsUrl,
  goals: goalsUrl,
  item_ailment_maps: itemAilmentMapsUrl,
  item_aliases: itemAliasesUrl,
  item_condition_maps: itemConditionMapsUrl,
  item_goal_maps: itemGoalMapsUrl,
  item_kosha_maps: itemKoshaMapsUrl,
  item_section_maps: itemSectionMapsUrl,
  koshas: koshasUrl,
  lifestyles: lifestylesUrl,
  media_assets: mediaAssetsUrl,
  posture_types: postureTypesUrl,
  practice_categories: practiceCategoriesUrl,
  practice_subtypes: practiceSubtypesUrl,
  practices: practicesUrl,
  protocol_items: protocolItemsUrl,
  protocols: protocolsUrl,
  sections: sectionsUrl,
});

let knowledgeRawTablesPromise = null;

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load knowledge asset: ${url}`);
  }
  return response.text();
}

export async function loadKnowledgeRawTables() {
  if (!knowledgeRawTablesPromise) {
    knowledgeRawTablesPromise = Promise.all(
      Object.entries(TABLE_URLS).map(async ([tableName, url]) => [tableName, await fetchText(url)])
    ).then((entries) => Object.fromEntries(entries));
  }

  return knowledgeRawTablesPromise;
}
