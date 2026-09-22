import {
  getSampleLibraryDatasets,
  publishSampleLibraryProcesses,
  SampleLibraryDatasetType,
  SampleLibraryItem,
  SampleLibraryOrigin,
  SampleLibraryPublicationStatus,
} from '@/services/sampleLibrary/api';
import {
  AppstoreOutlined,
  BankOutlined,
  BookOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { App, Button, Segmented, Select, Space, Tabs, Tag, Tooltip, Typography } from 'antd';
import type { Key } from 'react';
import { useMemo, useRef, useState } from 'react';
import { useIntl } from 'umi';
import SampleLibraryDetailButton from './DetailButton';
import { extractSampleLibraryName, parseSampleLibraryKey, sampleLibraryKeyOf } from './model';

export default function SampleLibraryPage() {
  const intl = useIntl();
  const { message, modal } = App.useApp();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [datasetType, setDatasetType] = useState<SampleLibraryDatasetType>('processes');
  const [origin, setOrigin] = useState<SampleLibraryOrigin>('all');
  const [publicationStatus, setPublicationStatus] = useState<SampleLibraryPublicationStatus>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [publishing, setPublishing] = useState(false);
  const resetAndReload = () => {
    setSelectedRowKeys([]);
    actionRef.current?.reloadAndRest?.();
  };

  const columns = useMemo<ProColumns<SampleLibraryItem>[]>(
    () => [
      {
        title: intl.formatMessage({
          id: 'pages.sampleLibrary.column.name',
          defaultMessage: 'Name',
        }),
        dataIndex: 'name',
        ellipsis: true,
        render: (_, row) => extractSampleLibraryName(row, datasetType, intl.locale),
      },
      {
        title: intl.formatMessage({ id: 'pages.sampleLibrary.column.id', defaultMessage: 'UUID' }),
        dataIndex: 'id',
        width: 310,
        render: (_, row) => <Typography.Text copyable>{row.id}</Typography.Text>,
      },
      {
        title: intl.formatMessage({
          id: 'pages.sampleLibrary.column.version',
          defaultMessage: 'Version',
        }),
        dataIndex: 'version',
        width: 120,
      },
      {
        title: intl.formatMessage({
          id: 'pages.sampleLibrary.column.origin',
          defaultMessage: 'Origin',
        }),
        dataIndex: 'origin',
        width: 130,
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
      ...(datasetType === 'processes'
        ? [
            {
              title: intl.formatMessage({
                id: 'pages.sampleLibrary.column.publicationStatus',
                defaultMessage: 'Publication status',
              }),
              dataIndex: 'published',
              width: 140,
              render: (_: unknown, row: SampleLibraryItem) => (
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
            } as ProColumns<SampleLibraryItem>,
          ]
        : []),
      {
        title: intl.formatMessage({
          id: 'pages.sampleLibrary.column.modifiedAt',
          defaultMessage: 'Modified at',
        }),
        dataIndex: 'modifiedAt',
        valueType: 'dateTime',
        width: 180,
      },
      {
        title: intl.formatMessage({
          id: 'pages.sampleLibrary.column.actions',
          defaultMessage: 'Actions',
        }),
        valueType: 'option',
        width: 90,
        render: (_, row) => (
          <SampleLibraryDetailButton type={datasetType} row={row} lang={intl.locale} />
        ),
      },
    ],
    [datasetType, intl.locale],
  );

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
    <PageContainer
      title={intl.formatMessage({
        id: 'pages.sampleLibrary.title',
        defaultMessage: 'Sample Library',
      })}
    >
      <Tabs
        activeKey={datasetType}
        items={[
          {
            key: 'lifecyclemodels',
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.type.lifecyclemodels',
              defaultMessage: 'Life Cycle Models',
            }),
          },
          {
            key: 'processes',
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.type.processes',
              defaultMessage: 'Processes',
            }),
          },
          {
            key: 'flows',
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.type.flows',
              defaultMessage: 'Flows',
            }),
          },
          {
            key: 'flowproperties',
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.type.flowproperties',
              defaultMessage: 'Flow Properties',
            }),
          },
          {
            key: 'unitgroups',
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.type.unitgroups',
              defaultMessage: 'Unit Groups',
            }),
          },
          {
            key: 'sources',
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.type.sources',
              defaultMessage: 'Sources',
            }),
          },
          {
            key: 'contacts',
            label: intl.formatMessage({
              id: 'pages.sampleLibrary.type.contacts',
              defaultMessage: 'Contacts',
            }),
          },
        ]}
        onChange={(value) => {
          setDatasetType(value as SampleLibraryDatasetType);
          setPublicationStatus('all');
          resetAndReload();
        }}
      />
      <Space wrap style={{ marginBottom: 16 }}>
        <Segmented<SampleLibraryOrigin>
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
            resetAndReload();
          }}
        />
        {datasetType === 'processes' ? (
          <Select<SampleLibraryPublicationStatus>
            value={publicationStatus}
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
            onChange={(value) => {
              setPublicationStatus(value);
              resetAndReload();
            }}
          />
        ) : null}
        {datasetType === 'processes' ? (
          <Tooltip
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
          </Tooltip>
        ) : null}
      </Space>
      <ProTable<SampleLibraryItem>
        key={`${datasetType}:${origin}:${publicationStatus}`}
        actionRef={actionRef}
        rowKey={sampleLibraryKeyOf}
        search={false}
        columns={columns}
        options={{ density: false, fullScreen: false }}
        request={async (params) => {
          try {
            const result = await getSampleLibraryDatasets({
              datasetType,
              origin,
              publicationStatus: datasetType === 'processes' ? publicationStatus : 'all',
              pageCurrent: params.current ?? 1,
              pageSize: params.pageSize ?? 20,
            });
            return { data: result.items, success: true, total: result.total };
          } catch (error) {
            message.error(error instanceof Error ? error.message : String(error));
            return { data: [], success: false, total: 0 };
          }
        }}
        pagination={{ defaultPageSize: 20, showSizeChanger: true }}
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
        tableAlertRender={({ selectedRowKeys: keys }) =>
          intl.formatMessage(
            { id: 'pages.sampleLibrary.selected', defaultMessage: 'Selected {count}' },
            { count: keys.length },
          )
        }
        tableAlertOptionRender={() => (
          <Button type='link' onClick={() => setSelectedRowKeys([])}>
            {intl.formatMessage({
              id: 'pages.sampleLibrary.clearSelection',
              defaultMessage: 'Clear',
            })}
          </Button>
        )}
      />
    </PageContainer>
  );
}
