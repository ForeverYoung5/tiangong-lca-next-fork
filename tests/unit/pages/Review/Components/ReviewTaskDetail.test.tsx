// @ts-nocheck
import ReviewTaskDetail from '@/pages/Review/Components/ReviewTaskDetail';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../helpers/testUtils';

jest.mock('@ant-design/icons', () => ({
  EyeOutlined: () => <span data-testid='eye-icon' />,
}));

jest.mock('@umijs/max', () => ({
  FormattedMessage: ({ defaultMessage, id }: any) => <>{defaultMessage ?? id}</>,
  useIntl: () => ({
    formatMessage: ({ defaultMessage, id }: any, values: Record<string, unknown> = {}) =>
      Object.entries(values).reduce(
        (message, [key, value]) => message.replace(`{${key}}`, String(value)),
        defaultMessage ?? id,
      ),
  }),
}));

jest.mock('antd', () => ({
  Button: ({ children, onClick }: any) => (
    <button type='button' onClick={onClick}>
      {children}
    </button>
  ),
  Space: ({ children }: any) => <div>{children}</div>,
  Tag: ({ children, color }: any) => <span data-color={color}>{children}</span>,
}));

const baseRecord = {
  id: 'review-1',
  name: 'Review task',
  targetTable: 'processes',
  reviewKind: 'process',
  json: { data: { version: '01.00.000' } },
  deadline: '2026-10-01T00:00:00.000Z',
  reviewerCount: 3,
  completedReviewerCount: 2,
  approveOpinionCount: 1,
  rejectOpinionCount: 1,
};

describe('ReviewTaskDetail', () => {
  it.each([
    [2, 'Approved', 'success'],
    [-1, 'Returned', 'error'],
    [1, 'In progress', 'processing'],
  ])('renders the status for state %s', async (stateCode, status, color) => {
    const user = userEvent.setup();
    render(
      <ReviewTaskDetail
        record={{ ...baseRecord, stateCode } as any}
        dataView={<span>Dataset view</span>}
        actions={<button type='button'>Task action</button>}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Review task' }));

    expect(screen.getByRole('dialog', { name: 'Review task' })).toBeInTheDocument();
    expect(screen.getByText(status)).toHaveAttribute('data-color', color);
    expect(screen.getByText('Dataset view')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Task action' })).toHaveLength(2);
    expect(screen.getByText('Approve: 1; reject: 1; pending: 1.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('uses safe fallbacks when optional task details are unavailable', async () => {
    const user = userEvent.setup();
    render(
      <ReviewTaskDetail
        record={
          {
            ...baseRecord,
            stateCode: 1,
            targetTable: undefined,
            reviewKind: undefined,
            json: undefined,
            deadline: undefined,
            reviewerCount: 1,
            completedReviewerCount: 2,
            approveOpinionCount: undefined,
            rejectOpinionCount: undefined,
          } as any
        }
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Review task' }));

    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    expect(
      screen.getByText('The submitted data is not available to this actor.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Approve: 0; reject: 0; pending: 0.')).toBeInTheDocument();
    expect(screen.queryByText('Actions')).not.toBeInTheDocument();
  });
});
