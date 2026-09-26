import AccessDenied from '@/components/AccessDenied';
import { getReviewUserRoleApi } from '@/services/roles/api';
import { PageContainer } from '@ant-design/pro-components';
import { FormattedMessage } from '@umijs/max';
import { Spin, Tabs } from 'antd';
import { useEffect, useRef, useState } from 'react';
import AssignmentReview from './Components/AssignmentReview';
import ReviewMember from './Components/ReviewMember';
import ReviewQualityDiagnostic from './Components/ReviewQualityDiagnostic';

const Review = () => {
  const [activeTabKey, setActiveTabKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [qualityDiagnosticOpen, setQualityDiagnosticOpen] = useState(false);
  const [userData, setUserData] = useState<{ user_id: string; role: string } | null>(null);
  const actionRef = useRef<any>(undefined);
  const unassignedTableRef = useRef<any>(undefined);
  const inProgressTableRef = useRef<any>(undefined);
  const submittedTableRef = useRef<any>(undefined);
  const completedTableRef = useRef<any>(undefined);
  const pendingTableRef = useRef<any>(undefined);

  const checkUserAuth = async () => {
    setLoading(true);
    try {
      const userData = await getReviewUserRoleApi();
      setUserData(userData);
    } catch (error) {
      console.error(error);
    } finally {
      setAuthResolved(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserAuth();
  }, []);

  const onTabChange = (key: string) => {
    setActiveTabKey(key);
    switch (key) {
      case 'unassigned':
        unassignedTableRef?.current?.reload();
        break;
      case 'in-progress':
        inProgressTableRef?.current?.reload();
        break;
      case 'submitted':
        submittedTableRef?.current?.reload();
        break;
      case 'pending':
        pendingTableRef?.current?.reload();
        break;
      case 'completed':
        completedTableRef?.current?.reload();
        break;
      case 'members':
        actionRef?.current?.reload();
        break;
    }
  };

  const isReviewAdmin = userData?.role === 'review-admin';
  const isReviewMember = userData?.role === 'review-member';
  const isAuthorized = isReviewAdmin || isReviewMember;

  const tabs = isReviewAdmin
    ? [
        {
          key: 'unassigned',
          label: <FormattedMessage id='pages.review.tabs.unassigned' />,
          children: (
            <AssignmentReview
              actionRef={unassignedTableRef}
              tableType='unassigned'
              userData={userData}
              onOpenQualityDiagnostic={() => setQualityDiagnosticOpen(true)}
            />
          ),
        },
        {
          key: 'in-progress',
          label: (
            <FormattedMessage id='pages.review.tabs.inProgress' defaultMessage='In Progress' />
          ),
          children: (
            <AssignmentReview
              actionRef={inProgressTableRef}
              tableType='in-progress'
              userData={userData}
              onOpenQualityDiagnostic={() => setQualityDiagnosticOpen(true)}
            />
          ),
        },
        {
          key: 'completed',
          label: <FormattedMessage id='pages.review.tabs.completed' defaultMessage='Completed' />,
          children: (
            <AssignmentReview
              actionRef={completedTableRef}
              tableType='completed'
              userData={userData}
            />
          ),
        },
        {
          key: 'members',
          label: <FormattedMessage id='pages.review.tabs.members' />,
          children: <ReviewMember userData={userData} />,
        },
      ]
    : [
        {
          key: 'pending',
          label: <FormattedMessage id='pages.review.tabs.pending' />,
          children: (
            <AssignmentReview actionRef={pendingTableRef} tableType='pending' userData={userData} />
          ),
        },
        {
          key: 'submitted',
          label: (
            <FormattedMessage
              id='pages.review.tabs.submitted'
              defaultMessage='Submitted Opinions'
            />
          ),
          children: (
            <AssignmentReview
              actionRef={submittedTableRef}
              tableType='submitted'
              userData={userData}
            />
          ),
        },
        {
          key: 'completed',
          label: <FormattedMessage id='pages.review.tabs.completed' defaultMessage='Completed' />,
          children: (
            <AssignmentReview
              actionRef={completedTableRef}
              tableType='completed'
              userData={userData}
            />
          ),
        },
      ];

  useEffect(() => {
    if (!isAuthorized) {
      setActiveTabKey('');
      return;
    }

    setActiveTabKey(isReviewAdmin ? 'unassigned' : 'pending');
  }, [isAuthorized, isReviewAdmin]);

  return (
    <PageContainer title={<FormattedMessage id='pages.review.title' />}>
      <Spin spinning={loading}>
        {!authResolved ? null : !isAuthorized ? (
          <AccessDenied />
        ) : (
          <>
            {isReviewAdmin && (
              <ReviewQualityDiagnostic
                open={qualityDiagnosticOpen}
                onClose={() => setQualityDiagnosticOpen(false)}
              />
            )}
            <Tabs
              activeKey={activeTabKey}
              onChange={onTabChange}
              tabPlacement='start'
              items={tabs}
            />
          </>
        )}
      </Spin>
    </PageContainer>
  );
};

export default Review;
