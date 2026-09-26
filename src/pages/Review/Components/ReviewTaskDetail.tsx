import type { ReviewsTable } from '@/services/reviews/data';
import { EyeOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Space, Tag } from 'antd';
import { useState } from 'react';

type ReviewTaskDetailProps = {
  record: ReviewsTable;
  dataView?: React.ReactNode;
  actions?: React.ReactNode;
};

const ReviewTaskDetail = ({ record, dataView, actions }: ReviewTaskDetailProps) => {
  const intl = useIntl();
  const [open, setOpen] = useState(false);
  const result =
    record.stateCode === 2
      ? intl.formatMessage({ id: 'pages.review.result.approved', defaultMessage: 'Approved' })
      : record.stateCode === -1
        ? intl.formatMessage({ id: 'pages.review.result.returned', defaultMessage: 'Returned' })
        : intl.formatMessage({
            id: 'pages.review.result.inProgress',
            defaultMessage: 'In progress',
          });

  return (
    <>
      <Button type='link' style={{ paddingInline: 0 }} onClick={() => setOpen(true)}>
        {record.name}
      </Button>
      {open && (
        <aside role='dialog' aria-label={record.name} style={{ padding: 24 }}>
          <Space wrap>
            <h3>{record.name}</h3>
            {actions}
            <Button onClick={() => setOpen(false)}>
              <FormattedMessage id='pages.button.close' defaultMessage='Close' />
            </Button>
          </Space>
          <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '8px 16px' }}>
            <dt>
              <FormattedMessage id='pages.review.reference.table' defaultMessage='Data type' />
            </dt>
            <dd>{record.targetTable ?? '-'}</dd>
            <dt>
              <FormattedMessage id='pages.review.reference.version' defaultMessage='Data version' />
            </dt>
            <dd>{record.json?.data?.version ?? '-'}</dd>
            <dt>
              <FormattedMessage id='pages.review.reviewKind' defaultMessage='Review kind' />
            </dt>
            <dd>{record.reviewKind ?? '-'}</dd>
            <dt>
              <FormattedMessage id='pages.review.table.status' defaultMessage='Status' />
            </dt>
            <dd>
              <Tag
                color={
                  record.stateCode === 2
                    ? 'success'
                    : record.stateCode === -1
                      ? 'error'
                      : 'processing'
                }
              >
                {result}
              </Tag>
            </dd>
            <dt>
              <FormattedMessage id='pages.review.table.column.deadline' defaultMessage='Deadline' />
            </dt>
            <dd>{record.deadline ? new Date(record.deadline).toLocaleString() : '-'}</dd>
            <dt>
              <FormattedMessage id='pages.review.progress.button' defaultMessage='Progress' />
            </dt>
            <dd>
              {record.completedReviewerCount ?? 0}/{record.reviewerCount ?? 0}
            </dd>
          </dl>
          <hr />
          <Space orientation='vertical' size='middle' style={{ width: '100%' }}>
            <h4>
              <FormattedMessage id='pages.review.detail.data' defaultMessage='Review data' />
            </h4>
            {dataView ?? (
              <span>
                <EyeOutlined />{' '}
                <FormattedMessage
                  id='pages.review.detail.dataUnavailable'
                  defaultMessage='The submitted data is not available to this actor.'
                />
              </span>
            )}
            <h4>
              <FormattedMessage
                id='pages.review.detail.opinions'
                defaultMessage='Reviewer opinions'
              />
            </h4>
            <span>
              {intl.formatMessage(
                {
                  id: 'pages.review.detail.opinionSummary',
                  defaultMessage: 'Approve: {approve}; reject: {reject}; pending: {pending}.',
                },
                {
                  approve: record.approveOpinionCount ?? 0,
                  reject: record.rejectOpinionCount ?? 0,
                  pending: Math.max(
                    0,
                    (record.reviewerCount ?? 0) - (record.completedReviewerCount ?? 0),
                  ),
                },
              )}
            </span>
            {actions && (
              <>
                <h4>
                  <FormattedMessage id='pages.review.actions' defaultMessage='Actions' />
                </h4>
                <Space wrap>{actions}</Space>
              </>
            )}
          </Space>
        </aside>
      )}
    </>
  );
};

export default ReviewTaskDetail;
