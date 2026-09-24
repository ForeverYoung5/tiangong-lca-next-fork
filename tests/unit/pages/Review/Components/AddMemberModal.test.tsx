// @ts-nocheck
import AddMemberModal from '@/pages/Review/Components/AddMemberModal';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../helpers/testUtils';

const mockAddReviewMemberApi = jest.fn();
const mockGetUserInfoByEmail = jest.fn();

jest.mock('@umijs/max', () => ({
  FormattedMessage: ({ id, defaultMessage }: any) => defaultMessage ?? id,
  useIntl: () => ({ formatMessage: ({ id, defaultMessage }: any) => defaultMessage ?? id }),
}));

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    App: {
      ...actual.App,
      useApp: () => ({ message: { success: jest.fn(), error: jest.fn() } }),
    },
  };
});

jest.mock('@/services/roles/api', () => ({
  addReviewMemberApi: (...args: any[]) => mockAddReviewMemberApi(...args),
}));
jest.mock('@/services/users/api', () => ({
  getUserInfoByEmail: (...args: any[]) => mockGetUserInfoByEmail(...args),
}));

describe('ReviewAddMemberModal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('adds a reviewer directly from the registered email without contact selection', async () => {
    mockGetUserInfoByEmail.mockResolvedValue({
      success: true,
      user: { id: 'reviewer-1' },
    });
    mockAddReviewMemberApi.mockResolvedValue({ success: true, error: null });
    const onCancel = jest.fn();
    const onSuccess = jest.fn();
    render(<AddMemberModal open onCancel={onCancel} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText('Email'), 'reviewer@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() =>
      expect(mockGetUserInfoByEmail).toHaveBeenCalledWith('reviewer@example.com'),
    );
    expect(mockAddReviewMemberApi).toHaveBeenCalledWith('reviewer-1');
    expect(onSuccess).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
    expect(screen.queryByText(/contact/i)).not.toBeInTheDocument();
  });

  it('does not add when no registered account matches the email', async () => {
    mockGetUserInfoByEmail.mockResolvedValue({ success: false, user: null });
    render(<AddMemberModal open onCancel={jest.fn()} onSuccess={jest.fn()} />);

    await userEvent.type(screen.getByLabelText('Email'), 'missing@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(mockGetUserInfoByEmail).toHaveBeenCalled());
    expect(mockAddReviewMemberApi).not.toHaveBeenCalled();
  });
});
