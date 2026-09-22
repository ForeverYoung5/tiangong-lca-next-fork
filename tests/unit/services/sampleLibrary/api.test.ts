const mockRpc = jest.fn();

jest.mock('@/services/supabase', () => ({
  __esModule: true,
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

import {
  getSampleLibraryDatasets,
  publishSampleLibraryProcesses,
} from '@/services/sampleLibrary/api';

describe('sample library API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps the manager catalog request and unwraps its page', async () => {
    const page = {
      datasetType: 'processes',
      page: 2,
      pageSize: 20,
      total: 21,
      items: [],
    };
    mockRpc.mockResolvedValue({ data: { ok: true, data: page }, error: null });

    await expect(
      getSampleLibraryDatasets({
        datasetType: 'processes',
        origin: 'literature',
        publicationStatus: 'unpublished',
        pageSize: 20,
        pageCurrent: 2,
      }),
    ).resolves.toEqual(page);
    expect(mockRpc).toHaveBeenCalledWith('qry_sample_library_datasets_v1', {
      p_dataset_type: 'processes',
      p_origin: 'literature',
      p_publication_status: 'unpublished',
      p_page_size: 20,
      p_page_current: 2,
    });
  });

  it('publishes exact Process identities and versions', async () => {
    const result = { requestedCount: 1, publishedCount: 1, alreadyPublishedCount: 0 };
    const items = [{ id: '68400000-0000-4000-8000-000000000010', version: '01.00.000' }];
    mockRpc.mockResolvedValue({ data: { ok: true, data: result }, error: null });

    await expect(publishSampleLibraryProcesses(items)).resolves.toEqual(result);
    expect(mockRpc).toHaveBeenCalledWith('cmd_sample_library_publish_processes_v1', {
      p_items: items,
    });
  });

  it.each([
    [
      'query transport error',
      () =>
        getSampleLibraryDatasets({
          datasetType: 'contacts',
          origin: 'all',
          publicationStatus: 'all',
          pageSize: 20,
          pageCurrent: 1,
        }),
    ],
    ['publish transport error', () => publishSampleLibraryProcesses([])],
  ])('propagates a %s', async (_label, invoke) => {
    const error = new Error('offline');
    mockRpc.mockResolvedValue({ data: null, error });
    await expect(invoke()).rejects.toBe(error);
  });

  it.each([
    [{ ok: false, message: 'denied' }, 'denied'],
    [{ ok: false, code: 'bad_request' }, 'bad_request'],
    [null, 'Unable to load sample library'],
  ])('fails closed for query envelope %#', async (data, expected) => {
    mockRpc.mockResolvedValue({ data, error: null });
    await expect(
      getSampleLibraryDatasets({
        datasetType: 'flows',
        origin: 'all',
        publicationStatus: 'all',
        pageSize: 20,
        pageCurrent: 1,
      }),
    ).rejects.toThrow(expected);
  });

  it('uses the publication fallback when its envelope has no diagnostic', async () => {
    mockRpc.mockResolvedValue({ data: { ok: false }, error: null });
    await expect(publishSampleLibraryProcesses([])).rejects.toThrow(
      'Unable to publish selected Processes',
    );
  });
});
