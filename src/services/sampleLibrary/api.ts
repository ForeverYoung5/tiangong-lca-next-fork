import { supabase } from '@/services/supabase';
export {
  getSampleLibraryFilters,
  getSampleLibraryRpcFilters,
  withSampleLibrarySearchFilters,
} from './filters';
export type {
  SampleLibraryFilters,
  SampleLibraryOrigin,
  SampleLibraryPublicationStatus,
} from './filters';

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
