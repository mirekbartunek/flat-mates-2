export type Feature = {
  id: string,
  text: string
  center: [number, number],
  place_name: string,
  relevance: number
}

export type SearchResults = {
  type: string,
  features: Feature[],
  query: string[],
  attribution: string

}

export const isSearchResult = (response: unknown): response is SearchResults => {
  if (!response || typeof response !== 'object') return false;

  const result = response as SearchResults;

  if (typeof result.type !== 'string') return false;
  if (!Array.isArray(result.features)) return false;
  if (!Array.isArray(result.query)) return false;
  if (typeof result.attribution !== 'string') return false;

  return result.features.every(feature =>
    typeof feature.id === 'string' &&
    typeof feature.text === 'string' &&
    Array.isArray(feature.center) &&
    feature.center.length === 2 &&
    typeof feature.center[0] === 'number' &&
    typeof feature.center[1] === 'number'
  );
};
