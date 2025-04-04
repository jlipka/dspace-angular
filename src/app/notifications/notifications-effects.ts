import { QualityAssuranceSourceEffects } from './qa/source/quality-assurance-source.effects';
import { QualityAssuranceTopicsEffects } from './qa/topics/quality-assurance-topics.effects';
import { SuggestionTargetsEffects } from './suggestions/targets/suggestion-targets.effects';

export const notificationsEffects = [
  QualityAssuranceTopicsEffects,
  QualityAssuranceSourceEffects,
  SuggestionTargetsEffects,
];
