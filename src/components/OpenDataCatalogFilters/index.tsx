import {
  DEFAULT_OPEN_DATA_FILTERS,
  type OpenDataCatalogFilters as OpenDataCatalogFilterValue,
  type OpenDataPublicationFilter,
  type OpenDataSourceFilter,
} from '@/services/openDataCatalog/types';
import { Space, Tooltip } from 'antd';
import type { FC, ReactNode } from 'react';
import { useIntl } from 'umi';

const CatalogIcon: FC<{ kind: OpenDataSourceFilter }> = ({ kind }) => (
  <svg aria-hidden='true' focusable='false' height='1em' viewBox='0 0 16 16' width='1em'>
    {kind === 'all' && (
      <path d='M1 1h6v6H1V1Zm8 0h6v6H9V1ZM1 9h6v6H1V9Zm8 0h6v6H9V9Z' fill='currentColor' />
    )}
    {kind === 'literature' && (
      <path
        d='M3 1h7l3 3v11H3V1Zm7 1.5V5h2.5L10 2.5ZM5 8h6V7H5v1Zm0 3h6v-1H5v1Z'
        fill='currentColor'
      />
    )}
    {kind === 'enterprise' && (
      <path d='M2 15V5l6-4 6 4v10h-3v-4H5v4H2Zm3-8h2V5H5v2Zm4 0h2V5H9v2Z' fill='currentColor' />
    )}
  </svg>
);

type Props = {
  includePublication?: boolean;
  onChange: (filters: OpenDataCatalogFilterValue) => void;
  value?: OpenDataCatalogFilterValue;
};

const OpenDataCatalogFilters: FC<Props> = ({
  includePublication = false,
  onChange,
  value = DEFAULT_OPEN_DATA_FILTERS,
}) => {
  const intl = useIntl();
  const sourceOptions: Array<{
    icon: ReactNode;
    label: string;
    value: OpenDataSourceFilter;
  }> = [
    {
      value: 'all',
      label: intl.formatMessage({
        id: 'pages.openData.source.all',
        defaultMessage: 'All data',
      }),
      icon: <CatalogIcon kind='all' />,
    },
    {
      value: 'literature',
      label: intl.formatMessage({
        id: 'pages.openData.source.literature',
        defaultMessage: 'Literature data',
      }),
      icon: <CatalogIcon kind='literature' />,
    },
    {
      value: 'enterprise',
      label: intl.formatMessage({
        id: 'pages.openData.source.enterprise',
        defaultMessage: 'Enterprise data',
      }),
      icon: <CatalogIcon kind='enterprise' />,
    },
  ];
  const publicationOptions: Array<{ label: string; value: OpenDataPublicationFilter }> = [
    {
      value: 'all',
      label: intl.formatMessage({
        id: 'pages.openData.publication.all',
        defaultMessage: 'All publication states',
      }),
    },
    {
      value: 'published',
      label: intl.formatMessage({
        id: 'pages.openData.publication.published',
        defaultMessage: 'Published',
      }),
    },
    {
      value: 'unpublished',
      label: intl.formatMessage({
        id: 'pages.openData.publication.unpublished',
        defaultMessage: 'Unpublished',
      }),
    },
  ];

  return (
    <Space size={8}>
      <span
        role='group'
        aria-label={intl.formatMessage({
          id: 'pages.openData.source.filter',
          defaultMessage: 'Data source filter',
        })}
      >
        {sourceOptions.map((option) => (
          <Tooltip key={option.value} title={option.label}>
            <button
              type='button'
              aria-label={option.label}
              aria-pressed={value.sourceFilter === option.value}
              style={{
                alignItems: 'center',
                background: value.sourceFilter === option.value ? '#1677ff' : 'transparent',
                border: '1px solid #d9d9d9',
                color: value.sourceFilter === option.value ? '#fff' : 'inherit',
                cursor: 'pointer',
                display: 'inline-flex',
                height: 32,
                justifyContent: 'center',
                width: 32,
              }}
              onClick={() => onChange({ ...value, sourceFilter: option.value })}
            >
              {option.icon}
            </button>
          </Tooltip>
        ))}
      </span>
      {includePublication && (
        <select
          aria-label={intl.formatMessage({
            id: 'pages.openData.publication.filter',
            defaultMessage: 'Publication filter',
          })}
          value={value.publicationFilter ?? 'all'}
          style={{ minWidth: 150 }}
          onChange={(event) =>
            onChange({
              ...value,
              publicationFilter: event.target.value as OpenDataPublicationFilter,
            })
          }
        >
          {publicationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Space>
  );
};

export default OpenDataCatalogFilters;
