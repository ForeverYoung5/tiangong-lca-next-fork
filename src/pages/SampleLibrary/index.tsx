import {
  responsiveDataListTableProps,
  useResponsiveDataListMobile,
} from '@/components/ResponsiveDataList';
import {
  getSampleLibraryDatasets,
  publishSampleLibraryProcesses,
  SampleLibraryOrigin,
  SampleLibraryPublicationStatus,
  type SampleLibraryItem,
} from '@/services/sampleLibrary/api';
import {
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { ActionType, PageContainer, ProTable } from '@ant-design/pro-components';
import { App, Button, Segmented, Select, Tooltip } from 'antd';
import type { Key } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl, useLocation } from 'umi';
import { getSampleLibraryColumns } from './columns';
import {
  parseSampleLibraryKey,
  resolveSampleLibraryDatasetType,
  sampleLibraryKeyOf,
} from './model';

const getTypeTitle = (
  intl: ReturnType<typeof useIntl>,
  datasetType: ReturnType<typeof resolveSampleLibraryDatasetType>,
) => {
  switch (datasetType) {
    case 'lifecyclemodels':
      return intl.formatMessage({
        id: 'pages.sampleLibrary.type.lifecyclemodels',
        defaultMessage: 'Life Cycle Models',
      });
    case 'processes':
      return intl.formatMessage({
        id: 'pages.sampleLibrary.type.processes',
        defaultMessage: 'Processes',
      });
    case 'flows':
      return intl.formatMessage({
        id: 'pages.sampleLibrary.type.flows',
        defaultMessage: 'Flows',
      });
    case 'flowproperties':
      return intl.formatMessage({
        id: 'pages.sampleLibrary.type.flowproperties',
        defaultMessage: 'Flow Properties',
      });
    case 'unitgroups':
      return intl.formatMessage({
        id: 'pages.sampleLibrary.type.unitgroups',
        defaultMessage: 'Unit Groups',
      });
    case 'sources':
      return intl.formatMessage({
        id: 'pages.sampleLibrary.type.sources',
        defaultMessage: 'Sources',
      });
    case 'contacts':
      return intl.formatMessage({
        id: 'pages.sampleLibrary.type.contacts',
        defaultMessage: 'Contacts',
      });
  }
};

export default function SampleLibraryPage() {
  const intl = useIntl();
  const location = useLocation();
  const { message, modal } = App.useApp();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const isMobile = useResponsiveDataListMobile();
  const datasetType = resolveSampleLibraryDatasetType(location.pathname);
  const [origin, setOrigin] = useState<SampleLibraryOrigin>('all');
  const [publicationStatus, setPublicationStatus] = useState<SampleLibraryPublicationStatus>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setPublicationStatus('all');
    setSelectedRowKeys([]);
  }, [datasetType]);

  const columns = useMemo(
    () => getSampleLibraryColumns({ type: datasetType, intl, isMobile }),
    [datasetType, intl, isMobile],
  );

  const typeTitle = getTypeTitle(intl, datasetType);

  const resetPageAndSelection = () => {
    setSelectedRowKeys([]);
    actionRef.current?.setPageInfo?.({ current: 1 });
  };

  const confirmPublish = () => {
    modal.confirm({
      title: intl.formatMessage({
        id: 'pages.sampleLibrary.publish.confirmTitle',
        defaultMessage: 'Publish selected Processes?',
      }),
      content: intl.formatMessage({
        id: 'pages.sampleLibrary.publish.confirmContent',
        defaultMessage:
          'Publishing records the selected exact versions and does not change their state.',
      }),
      okText: intl.formatMessage({
        id: 'pages.sampleLibrary.publish.action',
        defaultMessage: 'Publish',
      }),
      onOk: async () => {
        setPublishing(true);
        try {
          const result = await publishSampleLibraryProcesses(
            selectedRowKeys.map(parseSampleLibraryKey),
          );
          message.success(
            intl.formatMessage(
              {
                id: 'pages.sampleLibrary.publish.success',
                defaultMessage: 'Published {count} Process versions',
              },
              { count: result.publishedCount },
            ),
          );
          setSelectedRowKeys([]);
          actionRef.current?.reload();
        } catch (error) {
          message.error(error instanceof Error ? error.message : String(error));
          throw error;
        } finally {
          setPublishing(false);
        }
      },
    });
  };

  return (
    <PageContainer header={{ title: false, breadcrumb: {} }}>
      <ProTable<SampleLibraryItem>
        {...responsiveDataListTableProps}
        actionRef={actionRef}
        rowKey={sampleLibraryKeyOf}
        headerTitle={
          <>
            {intl.formatMessage({
              id: 'pages.sampleLibrary.title',
              defaultMessage: 'Sample Library',
            })}{' '}
            / {typeTitle}
          </>
        }
        params={{ datasetType, origin, publicationStatus }}
        search={false}
        options={isMobile ? false : { fullScreen: true }}
        toolBarRender={() => [
          <Segmented<SampleLibraryOrigin>
            key='origin'
            value={origin}
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
            onChange={(value) => {
              setOrigin(value);
              resetPageAndSelection();
            }}
          />,
          ...(datasetType === 'processes'
            ? [
                <Select<SampleLibraryPublicationStatus>
                  key='publication-status'
                  value={publicationStatus}
                  style={{ width: isMobile ? 128 : 150 }}
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
                  onChange={(value) => {
                    setPublicationStatus(value);
                    resetPageAndSelection();
                  }}
                />,
                <Tooltip
                  key='publish'
                  title={intl.formatMessage({
                    id: 'pages.sampleLibrary.publish.tooltip',
                    defaultMessage: 'Publish selected Process versions',
                  })}
                >
                  <Button
                    type='primary'
                    icon={<CloudUploadOutlined />}
                    disabled={selectedRowKeys.length === 0}
                    loading={publishing}
                    onClick={confirmPublish}
                  >
                    {intl.formatMessage({
                      id: 'pages.sampleLibrary.publish.action',
                      defaultMessage: 'Publish',
                    })}{' '}
                    ({selectedRowKeys.length})
                  </Button>
                </Tooltip>,
              ]
            : []),
        ]}
        request={async (params) => {
          try {
            const result = await getSampleLibraryDatasets({
              datasetType,
              origin,
              publicationStatus: datasetType === 'processes' ? publicationStatus : 'all',
              pageCurrent: params.current ?? 1,
              pageSize: params.pageSize ?? 10,
            });
            return { data: result.items, success: true, total: result.total };
          } catch (error) {
            message.error(error instanceof Error ? error.message : String(error));
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        rowSelection={
          datasetType === 'processes'
            ? {
                preserveSelectedRowKeys: true,
                selectedRowKeys,
                getCheckboxProps: (row) => ({ disabled: Boolean(row.published) }),
                onChange: (keys) => setSelectedRowKeys(keys),
              }
            : undefined
        }
        tableAlertRender={
          datasetType === 'processes'
            ? ({ selectedRowKeys: keys }) =>
                intl.formatMessage(
                  { id: 'pages.sampleLibrary.selected', defaultMessage: 'Selected {count}' },
                  { count: keys.length },
                )
            : false
        }
        tableAlertOptionRender={
          datasetType === 'processes'
            ? () => (
                <Button type='link' onClick={() => setSelectedRowKeys([])}>
                  {intl.formatMessage({
                    id: 'pages.sampleLibrary.clearSelection',
                    defaultMessage: 'Clear',
                  })}
                </Button>
              )
            : false
        }
        columns={columns}
      />
    </PageContainer>
  );
}
