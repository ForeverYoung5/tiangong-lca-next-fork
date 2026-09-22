/** @jest-environment node */

import { getSampleLibraryFilters } from '@/services/sampleLibrary/filters';

describe('sample library filters without a browser', () => {
  it('uses stable defaults during server-side rendering', () => {
    expect(getSampleLibraryFilters()).toEqual({
      origin: 'all',
      publicationStatus: 'all',
    });
  });
});
