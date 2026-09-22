import { supabase } from '@/services/supabase';

export type SampleLibraryDatasetType =
  | 'lifecyclemodels'
  | 'processes'
  | 'flows'
  | 'flowproperties'
  | 'unitgroups'
  | 'sources'
  | 'contacts';

export type SampleLibraryOrigin = 'all' | 'literature' | 'enterprise';
export type SampleLibraryPublicationStatus = 'all' | 'published' | 'unpublished';

export type SampleLibraryItem = {
  id: string;
  version: string;
  json: Record<string, any> | null;
  modifiedAt: string | null;
  origin: Exclude<SampleLibraryOrigin, 'all'>;
  published: boolean | null;
  publishedAt: string | null;
};

export type SampleLibraryPage = {
  datasetType: SampleLibraryDatasetType;
  page: number;
  pageSize: number;
  total: number;
  items: SampleLibraryItem[];
};

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

export async function getSampleLibraryDatasets(input: {
  datasetType: SampleLibraryDatasetType;
  origin: SampleLibraryOrigin;
  publicationStatus: SampleLibraryPublicationStatus;
  pageSize: number;
  pageCurrent: number;
}): Promise<SampleLibraryPage> {
  const { data, error } = await supabase.rpc('qry_sample_library_datasets_v1', {
    p_dataset_type: input.datasetType,
    p_origin: input.origin,
    p_publication_status: input.publicationStatus,
    p_page_size: input.pageSize,
    p_page_current: input.pageCurrent,
  });

  if (error) {
    throw error;
  }
  return unwrapRpc(data as RpcEnvelope<SampleLibraryPage> | null, 'Unable to load sample library');
}

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
