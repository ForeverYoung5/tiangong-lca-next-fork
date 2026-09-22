jest.mock('@/services/general/util', () => ({
  classificationToString: (value: Array<{ '#text'?: string }>) =>
    value
      ?.map((item) => item?.['#text'])
      .filter(Boolean)
      .join(' > ') || '-',
  getLangText: (value: { label?: string } | undefined) => value?.label ?? '-',
  jsonToList: (value: unknown) => (Array.isArray(value) ? value : value ? [value] : []),
}));
jest.mock('@/services/processes/util', () => ({
  genProcessName: (value: { label?: string }) => value?.label ?? '-',
}));

import {
  extractSampleLibraryDisplayFields,
  extractSampleLibraryName,
  parseSampleLibraryKey,
  resolveSampleLibraryDatasetType,
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
  it.each([
    ['/sample-library/models', 'lifecyclemodels'],
    ['/sample-library/processes', 'processes'],
    ['/sample-library/flows', 'flows'],
    ['/sample-library/flowproperties', 'flowproperties'],
    ['/sample-library/unitgroups', 'unitgroups'],
    ['/sample-library/sources', 'sources'],
    ['/sample-library/contacts', 'contacts'],
    ['/sample-library', 'lifecyclemodels'],
  ] as const)('resolves %s to %s', (pathname, type) => {
    expect(resolveSampleLibraryDatasetType(pathname)).toBe(type);
  });

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

  it('extracts process business columns used by the sample-library list', () => {
    const fields = extractSampleLibraryDisplayFields(
      row({
        processDataSet: {
          processInformation: {
            dataSetInformation: {
              name: { label: 'process' },
              classificationInformation: {
                'common:classification': {
                  'common:class': [{ '@level': '0', '#text': 'Energy' }],
                },
              },
            },
            time: { 'common:referenceYear': '2025' },
            geography: { locationOfOperationSupplyOrProduction: { '@location': 'CN' } },
          },
          modellingAndValidation: {
            LCIMethodAndAllocation: { typeOfDataSet: 'Unit process, single operation' },
          },
        },
      }),
      'processes',
      'en-US',
    );

    expect(fields).toMatchObject({
      name: 'process',
      classification: 'Energy',
      typeOfDataSet: 'Unit process, single operation',
      referenceYear: '2025',
      location: 'CN',
    });
  });

  it('extracts elementary Flow categorization and the Unit Group reference unit', () => {
    expect(
      extractSampleLibraryDisplayFields(
        row({
          flowDataSet: {
            flowInformation: {
              dataSetInformation: {
                classificationInformation: {
                  'common:elementaryFlowCategorization': {
                    'common:category': [{ '#text': 'Emissions' }],
                  },
                },
              },
            },
            modellingAndValidation: { LCIMethod: { typeOfDataSet: 'Elementary flow' } },
          },
        }),
        'flows',
        'en-US',
      ).classification,
    ).toBe('Emissions');

    expect(
      extractSampleLibraryDisplayFields(
        row({
          unitGroupDataSet: {
            unitGroupInformation: {
              quantitativeReference: { referenceToReferenceUnit: 'unit-1' },
            },
            units: {
              unit: [
                { '@dataSetInternalID': 'unit-0', name: 'm' },
                { '@dataSetInternalID': 'unit-1', name: 'kg' },
              ],
            },
          },
        }),
        'unitgroups',
        'en-US',
      ).quantitativeReference,
    ).toBe('kg');
  });

  it.each(['lifecyclemodels', 'processes', 'flows'] as const)(
    'falls back safely when a %s name is missing',
    (type) => {
      expect(extractSampleLibraryName(row(null), type, 'en-US')).toBe('-');
    },
  );
});
