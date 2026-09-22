jest.mock('@/components/ResponsiveDataList', () => ({
  DATA_LIST_COLUMN_RESPONSIVE: {
    desktop: ['md'],
    wide: ['lg'],
  },
  dataListActionColumn: (width: number) => ({ width }),
  dataListIndexColumn: () => ({ width: 64 }),
  dataListText: (primary: unknown, secondary?: unknown) => `${primary}:${secondary ?? ''}`,
  dataListTextColumn: (width: number, responsive?: string[]) => ({ width, responsive }),
  ResponsiveDataListActions: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/pages/SampleLibrary/DetailButton', () => () => <button type='button'>detail</button>);
jest.mock('@/pages/SampleLibrary/model', () => ({
  extractSampleLibraryDisplayFields: () => ({
    name: 'name',
    generalComment: 'comment',
    classification: 'classification',
    typeOfDataSet: 'dataset type',
    referenceYear: '2025',
    location: 'CN',
    flowType: 'Product flow',
    casNumber: '50-00-0',
    locationOfSupply: 'GLO',
    referenceUnit: 'kg',
    quantitativeReference: 'kg',
    publicationType: 'Article',
    email: 'contact@example.com',
  }),
}));

import { getSampleLibraryColumns } from '@/pages/SampleLibrary/columns';

const intl = {
  locale: 'en-US',
  formatMessage: ({ id, defaultMessage }: { id: string; defaultMessage?: string }) =>
    defaultMessage ?? id,
} as any;

type Item = {
  id: string;
  version: string;
  json: null;
  modifiedAt: string;
  origin: 'literature' | 'enterprise';
  published: boolean;
  publishedAt: null;
};

const item: Item = {
  id: '68400000-0000-4000-8000-000000000010',
  version: '01.00.000',
  json: null,
  modifiedAt: '2026-09-22T00:00:00Z',
  origin: 'enterprise',
  published: false,
  publishedAt: null,
};

type DatasetType =
  | 'lifecyclemodels'
  | 'processes'
  | 'flows'
  | 'flowproperties'
  | 'unitgroups'
  | 'sources'
  | 'contacts';

const renderColumns = (type: DatasetType, row: Item, isMobile = false) => {
  const columns = getSampleLibraryColumns({ type, intl, isMobile });
  columns.forEach((column) => {
    if (typeof column.render === 'function') {
      (column.render as (...args: unknown[]) => React.ReactNode)(undefined, row, 0, undefined);
    }
  });
  return columns;
};

describe('sample library columns', () => {
  it.each([
    [
      'lifecyclemodels',
      ['index', 'name', 'classification', 'version', 'origin', 'modifiedAt', 'option'],
    ],
    [
      'processes',
      [
        'index',
        'name',
        'classification',
        'typeOfDataSet',
        'referenceYear',
        'location',
        'version',
        'origin',
        'published',
        'modifiedAt',
        'option',
      ],
    ],
    [
      'flows',
      [
        'index',
        'name',
        'flowType',
        'classification',
        'casNumber',
        'locationOfSupply',
        'version',
        'origin',
        'modifiedAt',
        'option',
      ],
    ],
    [
      'flowproperties',
      [
        'index',
        'name',
        'classification',
        'referenceUnit',
        'version',
        'origin',
        'modifiedAt',
        'option',
      ],
    ],
    [
      'unitgroups',
      [
        'index',
        'name',
        'quantitativeReference',
        'classification',
        'version',
        'origin',
        'modifiedAt',
        'option',
      ],
    ],
    [
      'sources',
      [
        'index',
        'name',
        'classification',
        'publicationType',
        'version',
        'origin',
        'modifiedAt',
        'option',
      ],
    ],
    [
      'contacts',
      ['index', 'name', 'classification', 'email', 'version', 'origin', 'modifiedAt', 'option'],
    ],
  ] as const)('matches the Open Data field order for %s', (type, expected) => {
    const row =
      type === 'processes' ? { ...item, origin: 'literature' as const, published: true } : item;
    const columns = renderColumns(type, row, type === 'contacts');
    expect(columns.map((column) => column.dataIndex)).toEqual(expected);
    expect(columns[columns.length - 1]?.width).toBe(type === 'contacts' ? 72 : 96);
  });

  it('renders the unpublished Process state and enterprise origin variants', () => {
    const columns = getSampleLibraryColumns({ type: 'processes', intl, isMobile: false });
    for (const dataIndex of ['origin', 'published']) {
      const column = columns.find((candidate) => candidate.dataIndex === dataIndex);
      expect(typeof column?.render).toBe('function');
      (column?.render as (...args: unknown[]) => React.ReactNode)(undefined, item, 0, undefined);
    }
  });
});
