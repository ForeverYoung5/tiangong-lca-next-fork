import SampleLibraryControls from '@/pages/SampleLibrary/Controls';
import { fireEvent, render, screen } from '@testing-library/react';

const mockReplace = jest.fn();
let mockLocation = { pathname: '/sample-library/processes', search: '' };

jest.mock('umi', () => ({
  __esModule: true,
  history: { replace: (...args: unknown[]) => mockReplace(...args) },
  useIntl: () => ({
    formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id: string }) =>
      defaultMessage ?? id,
  }),
  useLocation: () => mockLocation,
}));

jest.mock('@ant-design/icons', () => ({
  __esModule: true,
  AppstoreOutlined: () => <span>all-icon</span>,
  BankOutlined: () => <span>enterprise-icon</span>,
  BookOutlined: () => <span>literature-icon</span>,
}));

jest.mock('antd', () => ({
  __esModule: true,
  Button: ({ 'aria-label': ariaLabel, icon, onClick }: any) => (
    <button type='button' aria-label={ariaLabel} onClick={onClick}>
      {icon}
    </button>
  ),
  Tooltip: ({ children, title }: any) => (
    <span data-testid='origin-tooltip' data-title={title}>
      {children}
    </span>
  ),
  Select: ({ options, onChange, value }: any) => (
    <select
      aria-label='publication-status'
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

describe('SampleLibraryControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation = { pathname: '/sample-library/processes', search: '' };
    window.history.replaceState({}, '', '/sample-library/processes');
  });

  it('does not render outside the sample library', () => {
    mockLocation = { pathname: '/open-data/processes', search: '' };
    const { container } = render(<SampleLibraryControls actionRef={{ current: undefined }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('cycles the icon-only origin filter and resets the shared table', () => {
    const reload = jest.fn();
    const setPageInfo = jest.fn();
    const onFiltersChange = jest.fn();
    const actionRef = { current: { reload, setPageInfo } } as any;

    const view = render(
      <SampleLibraryControls actionRef={actionRef} processes onFiltersChange={onFiltersChange} />,
    );

    expect(screen.getByTestId('origin-tooltip')).toHaveAttribute('data-title', 'All data');
    expect(screen.getByRole('button', { name: /all data/i })).toHaveTextContent('all-icon');
    expect(screen.getByLabelText('publication-status')).toHaveValue('all');
    fireEvent.click(screen.getByRole('button', { name: /all data/i }));

    expect(mockReplace).toHaveBeenCalledWith('/sample-library/processes?origin=literature');
    expect(onFiltersChange).toHaveBeenCalledTimes(1);
    expect(setPageInfo).toHaveBeenCalledWith({ current: 1 });
    expect(reload).toHaveBeenCalledTimes(1);

    mockLocation = { pathname: '/sample-library/processes', search: '?origin=literature' };
    window.history.replaceState({}, '', `${mockLocation.pathname}${mockLocation.search}`);
    view.rerender(
      <SampleLibraryControls actionRef={actionRef} processes onFiltersChange={onFiltersChange} />,
    );
    expect(screen.getByTestId('origin-tooltip')).toHaveAttribute('data-title', 'Literature data');
    expect(screen.getByRole('button', { name: /literature data/i })).toHaveTextContent(
      'literature-icon',
    );
    fireEvent.click(screen.getByRole('button', { name: /literature data/i }));
    expect(mockReplace).toHaveBeenLastCalledWith('/sample-library/processes?origin=enterprise');

    mockLocation = { pathname: '/sample-library/processes', search: '?origin=enterprise' };
    window.history.replaceState({}, '', `${mockLocation.pathname}${mockLocation.search}`);
    view.rerender(
      <SampleLibraryControls actionRef={actionRef} processes onFiltersChange={onFiltersChange} />,
    );
    expect(screen.getByTestId('origin-tooltip')).toHaveAttribute('data-title', 'Enterprise data');
    expect(screen.getByRole('button', { name: /enterprise data/i })).toHaveTextContent(
      'enterprise-icon',
    );
    fireEvent.click(screen.getByRole('button', { name: /enterprise data/i }));
    expect(mockReplace).toHaveBeenLastCalledWith('/sample-library/processes');
    expect(onFiltersChange).toHaveBeenCalledTimes(3);
    expect(setPageInfo).toHaveBeenCalledTimes(3);
    expect(reload).toHaveBeenCalledTimes(3);
  });

  it('removes all-valued filters while preserving unrelated query parameters', () => {
    mockLocation = {
      pathname: '/sample-library/processes',
      search: '?origin=enterprise&publicationStatus=published&keyword=steel',
    };
    window.history.replaceState({}, '', `${mockLocation.pathname}${mockLocation.search}`);
    const reload = jest.fn();

    render(<SampleLibraryControls actionRef={{ current: { reload } } as any} processes />);

    fireEvent.click(screen.getByRole('button', { name: /enterprise data/i }));
    expect(mockReplace).toHaveBeenLastCalledWith(
      '/sample-library/processes?publicationStatus=published&keyword=steel',
    );

    fireEvent.change(screen.getByLabelText('publication-status'), { target: { value: 'all' } });
    expect(mockReplace).toHaveBeenLastCalledWith(
      '/sample-library/processes?origin=enterprise&keyword=steel',
    );
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('keeps non-process pages origin-only and supports an empty query string', () => {
    mockLocation = { pathname: '/sample-library/flows', search: '' };
    window.history.replaceState({}, '', mockLocation.pathname);

    render(<SampleLibraryControls actionRef={{ current: undefined }} />);

    expect(screen.queryByLabelText('publication-status')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /all data/i }));
    expect(mockReplace).toHaveBeenCalledWith('/sample-library/flows?origin=literature');
  });

  it('sets the unpublished filter', () => {
    render(<SampleLibraryControls actionRef={{ current: undefined }} processes />);
    fireEvent.change(screen.getByLabelText('publication-status'), {
      target: { value: 'unpublished' },
    });
    expect(mockReplace).toHaveBeenCalledWith(
      '/sample-library/processes?publicationStatus=unpublished',
    );
  });
});
