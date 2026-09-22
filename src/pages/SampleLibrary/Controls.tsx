import type { ActionType } from '@ant-design/pro-components';
import { AppstoreOutlined, BankOutlined, BookOutlined } from '@ant-design/icons';
import { Segmented, Select } from 'antd';
import type { RefObject } from 'react';
import { useMemo } from 'react';
import { history, useIntl, useLocation } from 'umi';
import {
  getSampleLibraryFilters,
  type SampleLibraryOrigin,
  type SampleLibraryPublicationStatus,
} from '@/services/sampleLibrary/filters';

export default function SampleLibraryControls({
  actionRef,
  processes = false,
  onFiltersChange,
}: {
  actionRef: RefObject<ActionType | undefined>;
  processes?: boolean;
  onFiltersChange?: () => void;
}) {
  const intl = useIntl();
  const location = useLocation();
  const filters = useMemo(() => getSampleLibraryFilters(), [location.search]);

  if (!location.pathname.startsWith('/sample-library')) return null;

  const update = (next: Partial<typeof filters>) => {
    const value = { ...filters, ...next };
    const params = new URLSearchParams(location.search);
    if (value.origin === 'all') params.delete('origin');
    else params.set('origin', value.origin);
    if (value.publicationStatus === 'all') params.delete('publicationStatus');
    else params.set('publicationStatus', value.publicationStatus);
    history.replace(`${location.pathname}${params.size ? `?${params}` : ''}`);
    onFiltersChange?.();
    actionRef.current?.setPageInfo?.({ current: 1 });
    actionRef.current?.reload();
  };

  return (
    <>
      <Segmented<SampleLibraryOrigin>
        key='sample-library-origin'
        value={filters.origin}
        options={[
          {
            value: 'all',
            icon: <AppstoreOutlined />,
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.origin.all',
              defaultMessage: 'All data',
            }),
          },
          {
            value: 'literature',
            icon: <BookOutlined />,
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.origin.literature',
              defaultMessage: 'Literature data',
            }),
          },
          {
            value: 'enterprise',
            icon: <BankOutlined />,
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.origin.enterprise',
              defaultMessage: 'Enterprise data',
            }),
          },
        ]}
        onChange={(origin) => update({ origin })}
      />
      {processes ? (
        <Select<SampleLibraryPublicationStatus>
          key='sample-library-publication-status'
          value={filters.publicationStatus}
          style={{ width: 150 }}
          options={[
            {
              value: 'all',
              label: intl.formatMessage({
                id: 'pages.sampleLibrary.status.all',
                defaultMessage: 'All status',
              }),
            },
            {
              value: 'published',
              label: intl.formatMessage({
                id: 'pages.sampleLibrary.status.published',
                defaultMessage: 'Published',
              }),
            },
            {
              value: 'unpublished',
              label: intl.formatMessage({
                id: 'pages.sampleLibrary.status.unpublished',
                defaultMessage: 'Unpublished',
              }),
            },
          ]}
          onChange={(publicationStatus) => update({ publicationStatus })}
        />
      ) : null}
    </>
  );
}
