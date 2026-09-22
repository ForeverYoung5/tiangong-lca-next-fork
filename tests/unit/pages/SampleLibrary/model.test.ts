jest.mock('@/services/general/util', () => ({
  getLangText: (value: { label?: string } | undefined) => value?.label ?? '-',
}));
jest.mock('@/services/processes/util', () => ({
  genProcessName: (value: { label?: string }) => value?.label ?? '-',
}));

import {
  extractSampleLibraryName,
  parseSampleLibraryKey,
  sampleLibraryKeyOf,
} from '@/pages/SampleLibrary/model';
const row = (json: Record<string, any> | null) => ({
  id: '68400000-0000-4000-8000-000000000010',
  version: '01.00.000',
  json,
  modifiedAt: null,
  origin: 'literature' as const,
  published: false,
  publishedAt: null,
});

describe('sample library model', () => {
  it('keeps the exact id/version identity in table and publish keys', () => {
    const item = row(null);
    expect(sampleLibraryKeyOf(item)).toBe(`${item.id}:${item.version}`);
    expect(parseSampleLibraryKey(sampleLibraryKeyOf(item))).toEqual({
      id: item.id,
      version: item.version,
    });
    expect(parseSampleLibraryKey(123)).toEqual({ id: '', version: '123' });
  });

  it.each([
    [
      'lifecyclemodels',
      {
        lifeCycleModelDataSet: {
          lifeCycleModelInformation: { dataSetInformation: { name: { label: 'model' } } },
        },
      },
      'model',
    ],
    [
      'processes',
      {
        processDataSet: {
          processInformation: { dataSetInformation: { name: { label: 'process' } } },
        },
      },
      'process',
    ],
    [
      'flows',
      { flowDataSet: { flowInformation: { dataSetInformation: { name: { label: 'flow' } } } } },
      'flow',
    ],
    [
      'flowproperties',
      {
        flowPropertyDataSet: {
          flowPropertiesInformation: {
            dataSetInformation: { 'common:name': { label: 'property' } },
          },
        },
      },
      'property',
    ],
    [
      'unitgroups',
      {
        unitGroupDataSet: {
          unitGroupInformation: { dataSetInformation: { 'common:name': { label: 'unit' } } },
        },
      },
      'unit',
    ],
    [
      'contacts',
      {
        contactDataSet: {
          contactInformation: { dataSetInformation: { 'common:name': { label: 'contact' } } },
        },
      },
      'contact',
    ],
    [
      'sources',
      {
        sourceDataSet: {
          sourceInformation: { dataSetInformation: { sourceCitation: 'citation' } },
        },
      },
      'citation',
    ],
  ] as const)('extracts the %s display name', (type, json, expected) => {
    expect(extractSampleLibraryName(row(json), type, 'en-US')).toBe(expected);
  });

  it('falls back to a localized Source short name and tolerates empty content', () => {
    expect(
      extractSampleLibraryName(
        row({
          sourceDataSet: {
            sourceInformation: { dataSetInformation: { 'common:shortName': { label: 'short' } } },
          },
        }),
        'sources',
        'en-US',
      ),
    ).toBe('short');
    expect(extractSampleLibraryName(row(null), 'contacts', 'en-US')).toBe('-');
  });

  it.each(['lifecyclemodels', 'processes', 'flows'] as const)(
    'falls back safely when a %s name is missing',
    (type) => {
      expect(extractSampleLibraryName(row(null), type, 'en-US')).toBe('-');
    },
  );
});
