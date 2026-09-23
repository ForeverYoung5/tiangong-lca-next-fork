import OpenDataCatalogFilters from '@/components/OpenDataCatalogFilters';
import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('umi', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage, id }: { defaultMessage?: string; id: string }) =>
      defaultMessage ?? id,
  }),
}));

jest.mock('antd', () => ({
  Space: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <>{children}</>,
}));

describe('OpenDataCatalogFilters', () => {
  it('switches source and publication filters without URL state', () => {
    const onChange = jest.fn();
    render(
      <OpenDataCatalogFilters
        includePublication
        value={{ sourceFilter: 'all', publicationFilter: 'all' }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('Enterprise data'));
    expect(onChange).toHaveBeenCalledWith({ sourceFilter: 'enterprise', publicationFilter: 'all' });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'published' } });
    expect(onChange).toHaveBeenCalledWith({ sourceFilter: 'all', publicationFilter: 'published' });
  });

  it('defaults to all sources and hides publication controls', () => {
    render(<OpenDataCatalogFilters onChange={jest.fn()} />);
    expect(screen.getByLabelText('All data')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Data source filter')).toHaveAttribute('role', 'group');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('defaults a missing publication value to all states', () => {
    render(
      <OpenDataCatalogFilters
        includePublication
        value={{ sourceFilter: 'literature' }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('all');
  });
});
