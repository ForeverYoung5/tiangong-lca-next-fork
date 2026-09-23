export type SampleLibraryOrigin = 'all' | 'literature' | 'enterprise';
export type SampleLibraryPublicationStatus = 'all' | 'published' | 'unpublished';

export type SampleLibraryFilters = {
  origin: SampleLibraryOrigin;
  publicationStatus: SampleLibraryPublicationStatus;
};

const normalizeOrigin = (value: string | null): SampleLibraryOrigin =>
  value === 'literature' || value === 'enterprise' ? value : 'all';

const normalizePublicationStatus = (value: string | null): SampleLibraryPublicationStatus =>
  value === 'published' || value === 'unpublished' ? value : 'all';

const getCurrentRouteSearch = () => {
  if (typeof window === 'undefined') return '';
  const hashSearchIndex = window.location.hash.indexOf('?');
  return hashSearchIndex >= 0
    ? window.location.hash.slice(hashSearchIndex)
    : window.location.search;
};

export function getSampleLibraryFilters(search = getCurrentRouteSearch()): SampleLibraryFilters {
  const params = new URLSearchParams(search);
  return {
    origin: normalizeOrigin(params.get('origin')),
    publicationStatus: normalizePublicationStatus(params.get('publicationStatus')),
  };
}

export function withSampleLibrarySearchFilters(
  dataSource: string,
  filterCondition: unknown,
): unknown {
  if (dataSource !== 'sl') return filterCondition;
  const filters = getSampleLibraryFilters();
  return {
    ...(filterCondition && typeof filterCondition === 'object' ? filterCondition : {}),
    __sampleLibraryOrigin: filters.origin,
    __sampleLibraryPublicationStatus: filters.publicationStatus,
  };
}

export function getSampleLibraryRpcFilters(dataSource: string) {
  if (dataSource !== 'sl') return {};
  const filters = getSampleLibraryFilters();
  return {
    sample_origin_filter: filters.origin,
    sample_publication_status_filter: filters.publicationStatus,
  };
}
