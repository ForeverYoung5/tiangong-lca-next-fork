import { supabase } from '@/services/supabase';

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

export function getSampleLibraryFilters(): SampleLibraryFilters {
  if (typeof window === 'undefined') {
    return { origin: 'all', publicationStatus: 'all' };
  }
  const params = new URLSearchParams(window.location.search);
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
  const filters = getSampleLibraryFilters();
  return dataSource === 'sl'
    ? {
        sample_origin_filter: filters.origin,
        sample_publication_status_filter: filters.publicationStatus,
      }
    : {
        sample_origin_filter: 'all' as const,
        sample_publication_status_filter: 'all' as const,
      };
}

type RpcEnvelope<T> = {
  ok?: boolean;
  data?: T;
  code?: string;
  message?: string;
};

const unwrapRpc = <T>(response: RpcEnvelope<T> | null, fallback: string): T => {
  if (!response?.ok || !response.data) {
    throw new Error(response?.message || response?.code || fallback);
  }
  return response.data;
};

export type PublishProcessResult = {
  requestedCount: number;
  publishedCount: number;
  alreadyPublishedCount: number;
};

export async function publishSampleLibraryProcesses(
  items: Array<{ id: string; version: string }>,
): Promise<PublishProcessResult> {
  const { data, error } = await supabase.rpc('cmd_sample_library_publish_processes_v1', {
    p_items: items,
  });

  if (error) {
    throw error;
  }
  return unwrapRpc(
    data as RpcEnvelope<PublishProcessResult> | null,
    'Unable to publish selected Processes',
  );
}

export async function getSampleLibraryProcessPublicationMap(
  items: Array<{ id: string; version: string }>,
): Promise<Map<string, { published: boolean; publishedAt: string | null }>> {
  if (items.length === 0) return new Map();
  const { data, error } = await supabase.rpc('qry_sample_library_process_publications_v1', {
    p_items: items,
  } as never);
  if (error) throw error;
  const rows = unwrapRpc(
    data as RpcEnvelope<
      Array<{ id: string; version: string; published: boolean; publishedAt: string | null }>
    > | null,
    'Unable to load sample-library publication status',
  );
  return new Map(rows.map((row) => [`${row.id}-${row.version}`, row]));
}
