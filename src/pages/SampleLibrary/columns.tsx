import {
  DATA_LIST_COLUMN_RESPONSIVE,
  dataListActionColumn,
  dataListIndexColumn,
  dataListText,
  dataListTextColumn,
  ResponsiveDataListActions,
} from '@/components/ResponsiveDataList';
import type { SampleLibraryDatasetType, SampleLibraryItem } from '@/services/sampleLibrary/api';
import type { ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import type { useIntl } from 'umi';
import SampleLibraryDetailButton from './DetailButton';
import { extractSampleLibraryDisplayFields } from './model';

type IntlShape = ReturnType<typeof useIntl>;

const fieldColumn = (
  title: React.ReactNode,
  dataIndex: string,
  render: (row: SampleLibraryItem) => React.ReactNode,
  width: number,
  responsive?: ProColumns<SampleLibraryItem>['responsive'],
): ProColumns<SampleLibraryItem> => ({
  ...dataListTextColumn<SampleLibraryItem>(width, responsive),
  title,
  dataIndex,
  search: false,
  render: (_, row) => render(row),
});

export const getSampleLibraryColumns = ({
  type,
  intl,
  isMobile,
}: {
  type: SampleLibraryDatasetType;
  intl: IntlShape;
  isMobile: boolean;
}): ProColumns<SampleLibraryItem>[] => {
  const fields = (row: SampleLibraryItem) =>
    extractSampleLibraryDisplayFields(row, type, intl.locale);
  const columns: ProColumns<SampleLibraryItem>[] = [
    {
      ...dataListIndexColumn<SampleLibraryItem>(),
      title: intl.formatMessage({ id: 'pages.table.title.index', defaultMessage: 'Index' }),
      dataIndex: 'index',
      valueType: 'index',
    },
    fieldColumn(
      intl.formatMessage({ id: 'pages.table.title.name', defaultMessage: 'Name' }),
      'name',
      (row) => dataListText(fields(row).name, fields(row).generalComment),
      type === 'contacts' ? 280 : type === 'lifecyclemodels' ? 320 : 300,
    ),
  ];

  if (type === 'processes') {
    columns.push(
      fieldColumn(
        intl.formatMessage({
          id: 'pages.table.title.classification',
          defaultMessage: 'Classification',
        }),
        'classification',
        (row) => dataListText(fields(row).classification),
        260,
        DATA_LIST_COLUMN_RESPONSIVE.wide,
      ),
      fieldColumn(
        intl.formatMessage({
          id: 'pages.process.view.modellingAndValidation.typeOfDataSet',
          defaultMessage: 'Dataset type',
        }),
        'typeOfDataSet',
        (row) => dataListText(fields(row).typeOfDataSet),
        180,
        DATA_LIST_COLUMN_RESPONSIVE.desktop,
      ),
      fieldColumn(
        intl.formatMessage({ id: 'pages.process.referenceYear', defaultMessage: 'Reference year' }),
        'referenceYear',
        (row) => dataListText(fields(row).referenceYear),
        132,
        DATA_LIST_COLUMN_RESPONSIVE.wide,
      ),
      fieldColumn(
        intl.formatMessage({ id: 'pages.process.location', defaultMessage: 'Location' }),
        'location',
        (row) => dataListText(fields(row).location),
        132,
        DATA_LIST_COLUMN_RESPONSIVE.desktop,
      ),
    );
  } else if (type === 'flows') {
    columns.push(
      fieldColumn(
        intl.formatMessage({ id: 'pages.flow.flowType', defaultMessage: 'Flow type' }),
        'flowType',
        (row) => dataListText(fields(row).flowType),
        160,
        DATA_LIST_COLUMN_RESPONSIVE.desktop,
      ),
      fieldColumn(
        intl.formatMessage({
          id: 'pages.table.title.classification',
          defaultMessage: 'Classification',
        }),
        'classification',
        (row) => dataListText(fields(row).classification),
        260,
        DATA_LIST_COLUMN_RESPONSIVE.wide,
      ),
      fieldColumn(
        intl.formatMessage({ id: 'pages.flow.CASNumber', defaultMessage: 'CAS Number' }),
        'casNumber',
        (row) => dataListText(fields(row).casNumber),
        132,
        DATA_LIST_COLUMN_RESPONSIVE.wide,
      ),
      fieldColumn(
        intl.formatMessage({
          id: 'pages.flow.locationOfSupply',
          defaultMessage: 'Location of supply',
        }),
        'locationOfSupply',
        (row) => dataListText(fields(row).locationOfSupply),
        168,
        DATA_LIST_COLUMN_RESPONSIVE.wide,
      ),
    );
  } else {
    columns.push(
      fieldColumn(
        intl.formatMessage({
          id: 'pages.table.title.classification',
          defaultMessage: 'Classification',
        }),
        'classification',
        (row) => dataListText(fields(row).classification),
        260,
        DATA_LIST_COLUMN_RESPONSIVE.desktop,
      ),
    );
    if (type === 'flowproperties') {
      columns.push(
        fieldColumn(
          intl.formatMessage({
            id: 'pages.flowproperty.referenceToReferenceUnitGroup',
            defaultMessage: 'Reference unit',
          }),
          'referenceUnit',
          (row) => dataListText(fields(row).referenceUnit),
          260,
          DATA_LIST_COLUMN_RESPONSIVE.desktop,
        ),
      );
    } else if (type === 'unitgroups') {
      columns.splice(
        columns.length - 1,
        0,
        fieldColumn(
          intl.formatMessage({
            id: 'pages.unitgroup.unit.quantitativeReference',
            defaultMessage: 'Quantitative reference',
          }),
          'quantitativeReference',
          (row) => dataListText(fields(row).quantitativeReference),
          180,
          DATA_LIST_COLUMN_RESPONSIVE.desktop,
        ),
      );
    } else if (type === 'sources') {
      columns.push(
        fieldColumn(
          intl.formatMessage({
            id: 'pages.source.publicationType',
            defaultMessage: 'Publication type',
          }),
          'publicationType',
          (row) => dataListText(fields(row).publicationType),
          180,
          DATA_LIST_COLUMN_RESPONSIVE.desktop,
        ),
      );
    } else if (type === 'contacts') {
      columns.push(
        fieldColumn(
          intl.formatMessage({ id: 'pages.contact.email', defaultMessage: 'E-mail' }),
          'email',
          (row) => dataListText(fields(row).email),
          220,
          DATA_LIST_COLUMN_RESPONSIVE.desktop,
        ),
      );
    }
  }

  columns.push(
    fieldColumn(
      intl.formatMessage({ id: 'pages.table.title.version', defaultMessage: 'Version' }),
      'version',
      (row) => dataListText(row.version),
      132,
    ),
    {
      ...dataListTextColumn<SampleLibraryItem>(130),
      title: intl.formatMessage({
        id: 'pages.sampleLibrary.column.origin',
        defaultMessage: 'Origin',
      }),
      dataIndex: 'origin',
      render: (_, row) => (
        <Tag color={row.origin === 'literature' ? 'blue' : 'gold'}>
          {row.origin === 'literature'
            ? intl.formatMessage({
                id: 'pages.sampleLibrary.origin.literature',
                defaultMessage: 'Literature data',
              })
            : intl.formatMessage({
                id: 'pages.sampleLibrary.origin.enterprise',
                defaultMessage: 'Enterprise data',
              })}
        </Tag>
      ),
    },
  );
  if (type === 'processes') {
    columns.push({
      ...dataListTextColumn<SampleLibraryItem>(140),
      title: intl.formatMessage({
        id: 'pages.sampleLibrary.column.publicationStatus',
        defaultMessage: 'Publication status',
      }),
      dataIndex: 'published',
      render: (_, row) => (
        <Tag color={row.published ? 'success' : 'default'}>
          {row.published
            ? intl.formatMessage({
                id: 'pages.sampleLibrary.status.published',
                defaultMessage: 'Published',
              })
            : intl.formatMessage({
                id: 'pages.sampleLibrary.status.unpublished',
                defaultMessage: 'Unpublished',
              })}
        </Tag>
      ),
    });
  }
  columns.push(
    {
      ...dataListTextColumn<SampleLibraryItem>(180, DATA_LIST_COLUMN_RESPONSIVE.wide),
      title: intl.formatMessage({
        id: 'pages.table.title.updatedAt',
        defaultMessage: 'Updated at',
      }),
      dataIndex: 'modifiedAt',
      valueType: 'dateTime',
    },
    {
      ...dataListActionColumn<SampleLibraryItem>(isMobile ? 72 : 96),
      title: intl.formatMessage({ id: 'pages.table.title.option', defaultMessage: 'Actions' }),
      dataIndex: 'option',
      render: (_, row) => (
        <ResponsiveDataListActions isMobile={isMobile}>
          <SampleLibraryDetailButton type={type} row={row} lang={intl.locale} />
        </ResponsiveDataListActions>
      ),
    },
  );
  return columns;
};
