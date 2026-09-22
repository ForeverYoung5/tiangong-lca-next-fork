const mockRpc = jest.fn();

jest.mock('@/services/supabase', () => ({
  __esModule: true,
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

import {
  getSampleLibraryFilters,
  getSampleLibraryProcessPublicationMap,
  getSampleLibraryRpcFilters,
  publishSampleLibraryProcesses,
  withSampleLibrarySearchFilters,
} from '@/services/sampleLibrary/api';

describe('sample library API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('publishes exact Process identities and versions', async () => {
    const result = { requestedCount: 1, publishedCount: 1, alreadyPublishedCount: 0 };
    const items = [{ id: '68400000-0000-4000-8000-000000000010', version: '01.00.000' }];
    mockRpc.mockResolvedValue({ data: { ok: true, data: result }, error: null });

    await expect(publishSampleLibraryProcesses(items)).resolves.toEqual(result);
    expect(mockRpc).toHaveBeenCalledWith('cmd_sample_library_publish_processes_v1', {
      p_items: items,
    });
  });

  it('adds independent sl controls without changing other data sources', () => {
    window.history.replaceState(
      {},
      '',
      '/sample-library/processes?origin=enterprise&publicationStatus=published',
    );
    expect(getSampleLibraryFilters()).toEqual({
      origin: 'enterprise',
      publicationStatus: 'published',
    });
    expect(getSampleLibraryRpcFilters('sl')).toEqual({
      sample_origin_filter: 'enterprise',
      sample_publication_status_filter: 'published',
    });
    expect(getSampleLibraryRpcFilters('tg')).toEqual({});
    expect(withSampleLibrarySearchFilters('sl', { classification: ['steel'] })).toEqual({
      classification: ['steel'],
      __sampleLibraryOrigin: 'enterprise',
      __sampleLibraryPublicationStatus: 'published',
    });
    expect(withSampleLibrarySearchFilters('tg', { classification: ['steel'] })).toEqual({
      classification: ['steel'],
    });
  });

  it('normalizes invalid filters and accepts non-object shared-search input', () => {
    window.history.replaceState(
      {},
      '',
      '/sample-library/processes?origin=invalid&publicationStatus=invalid',
    );
    expect(getSampleLibraryFilters()).toEqual({ origin: 'all', publicationStatus: 'all' });
    expect(withSampleLibrarySearchFilters('sl', null)).toEqual({
      __sampleLibraryOrigin: 'all',
      __sampleLibraryPublicationStatus: 'all',
    });

    window.history.replaceState(
      {},
      '',
      '/sample-library/processes?origin=literature&publicationStatus=unpublished',
    );
    expect(getSampleLibraryFilters()).toEqual({
      origin: 'literature',
      publicationStatus: 'unpublished',
    });
    expect(withSampleLibrarySearchFilters('sl', 'ignored')).toEqual({
      __sampleLibraryOrigin: 'literature',
      __sampleLibraryPublicationStatus: 'unpublished',
    });
  });

  it('maps exact Process publication status for a shared search page', async () => {
    mockRpc.mockResolvedValue({
      data: {
        ok: true,
        data: [
          {
            id: '68400000-0000-4000-8000-000000000010',
            version: '01.00.000',
            published: true,
            publishedAt: '2026-09-22T00:00:00Z',
          },
        ],
      },
      error: null,
    });
    const result = await getSampleLibraryProcessPublicationMap([
      { id: '68400000-0000-4000-8000-000000000010', version: '01.00.000' },
    ]);
    expect(result.get('68400000-0000-4000-8000-000000000010-01.00.000')).toEqual(
      expect.objectContaining({ published: true }),
    );
  });

  it('propagates a publish transport error', async () => {
    const error = new Error('offline');
    mockRpc.mockResolvedValue({ data: null, error });
    await expect(publishSampleLibraryProcesses([])).rejects.toBe(error);
  });

  it('uses the publication fallback when its envelope has no diagnostic', async () => {
    mockRpc.mockResolvedValue({ data: { ok: false }, error: null });
    await expect(publishSampleLibraryProcesses([])).rejects.toThrow(
      'Unable to publish selected Processes',
    );
  });

  it('uses an RPC message or code when the publish envelope is rejected', async () => {
    mockRpc.mockResolvedValueOnce({ data: { ok: false, message: 'not allowed' }, error: null });
    await expect(publishSampleLibraryProcesses([])).rejects.toThrow('not allowed');

    mockRpc.mockResolvedValueOnce({
      data: { ok: false, code: 'sample_library_denied' },
      error: null,
    });
    await expect(publishSampleLibraryProcesses([])).rejects.toThrow('sample_library_denied');
  });

  it('returns an empty publication map without calling the database', async () => {
    await expect(getSampleLibraryProcessPublicationMap([])).resolves.toEqual(new Map());
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('propagates publication-map transport and envelope failures', async () => {
    const error = new Error('offline');
    mockRpc.mockResolvedValueOnce({ data: null, error });
    await expect(
      getSampleLibraryProcessPublicationMap([{ id: 'process-1', version: '01.00.000' }]),
    ).rejects.toBe(error);

    mockRpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(
      getSampleLibraryProcessPublicationMap([{ id: 'process-1', version: '01.00.000' }]),
    ).rejects.toThrow('Unable to load sample-library publication status');
  });
});
