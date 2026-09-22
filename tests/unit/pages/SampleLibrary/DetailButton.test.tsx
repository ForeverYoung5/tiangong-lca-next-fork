import { render, screen } from '@testing-library/react';

type DrawerProps = {
  id: string;
  version: string;
  lang: string;
  buttonType: string;
  disabled?: boolean;
};

function mockView(type: string, props: DrawerProps) {
  return <button type='button' data-testid={`drawer-${type}`} data-props={JSON.stringify(props)} />;
}

jest.mock(
  '@/pages/LifeCycleModels/Components/view',
  () => (props: DrawerProps) => mockView('lifecyclemodels', props),
);
jest.mock(
  '@/pages/Processes/Components/view',
  () => (props: DrawerProps) => mockView('processes', props),
);
jest.mock('@/pages/Flows/Components/view', () => (props: DrawerProps) => mockView('flows', props));
jest.mock(
  '@/pages/Flowproperties/Components/view',
  () => (props: DrawerProps) => mockView('flowproperties', props),
);
jest.mock(
  '@/pages/Unitgroups/Components/view',
  () => (props: DrawerProps) => mockView('unitgroups', props),
);
jest.mock(
  '@/pages/Sources/Components/view',
  () => (props: DrawerProps) => mockView('sources', props),
);
jest.mock(
  '@/pages/Contacts/Components/view',
  () => (props: DrawerProps) => mockView('contacts', props),
);

import SampleLibraryDetailButton from '@/pages/SampleLibrary/DetailButton';
const item = {
  id: '68400000-0000-4000-8000-000000000010',
  version: '01.00.000',
  json: null,
  modifiedAt: null,
  origin: 'literature' as const,
  published: false,
  publishedAt: null,
};

describe('SampleLibraryDetailButton', () => {
  it.each([
    'lifecyclemodels',
    'processes',
    'flows',
    'flowproperties',
    'unitgroups',
    'sources',
    'contacts',
  ] as const)('reuses the existing %s drawer without navigation', (type) => {
    render(<SampleLibraryDetailButton type={type} row={item} lang='zh-CN' />);

    const trigger = screen.getByTestId(`drawer-${type}`);
    const props = JSON.parse(trigger.getAttribute('data-props') ?? '{}') as DrawerProps;
    expect(props).toMatchObject({
      id: item.id,
      version: item.version,
      lang: 'zh-CN',
      buttonType: 'icon',
    });
    expect(props.disabled).toBe(type === 'processes' ? false : undefined);
  });
});
