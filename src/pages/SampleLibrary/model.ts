import { getLangText } from '@/services/general/util';
import { genProcessName } from '@/services/processes/util';
import type { SampleLibraryDatasetType, SampleLibraryItem } from '@/services/sampleLibrary/api';
import type { Key } from 'react';

export const sampleLibraryKeyOf = (row: Pick<SampleLibraryItem, 'id' | 'version'>) =>
  `${row.id}:${row.version}`;

export const parseSampleLibraryKey = (key: Key) => {
  const value = String(key);
  const separator = value.lastIndexOf(':');
  if (separator < 0) {
    return { id: '', version: value };
  }
  return { id: value.slice(0, separator), version: value.slice(separator + 1) };
};

export const extractSampleLibraryName = (
  row: SampleLibraryItem,
  type: SampleLibraryDatasetType,
  lang: string,
) => {
  const content = row.json ?? {};
  if (type === 'lifecyclemodels') {
    return genProcessName(
      content?.lifeCycleModelDataSet?.lifeCycleModelInformation?.dataSetInformation?.name ?? {},
      lang,
    );
  }
  if (type === 'processes') {
    return genProcessName(
      content?.processDataSet?.processInformation?.dataSetInformation?.name ?? {},
      lang,
    );
  }
  if (type === 'flows') {
    return genProcessName(
      content?.flowDataSet?.flowInformation?.dataSetInformation?.name ?? {},
      lang,
    );
  }
  if (type === 'flowproperties') {
    return getLangText(
      content?.flowPropertyDataSet?.flowPropertiesInformation?.dataSetInformation?.['common:name'],
      lang,
    );
  }
  if (type === 'unitgroups') {
    return getLangText(
      content?.unitGroupDataSet?.unitGroupInformation?.dataSetInformation?.['common:name'],
      lang,
    );
  }
  if (type === 'contacts') {
    return getLangText(
      content?.contactDataSet?.contactInformation?.dataSetInformation?.['common:name'],
      lang,
    );
  }
  const sourceInfo = content?.sourceDataSet?.sourceInformation?.dataSetInformation;
  return sourceInfo?.sourceCitation || getLangText(sourceInfo?.['common:shortName'], lang);
};
