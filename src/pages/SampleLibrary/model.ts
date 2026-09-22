import { classificationToString, getLangText, jsonToList } from '@/services/general/util';
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

export const resolveSampleLibraryDatasetType = (pathname: string): SampleLibraryDatasetType => {
  const routeParts = pathname.split('/').filter(Boolean);
  const routeType = routeParts[routeParts.length - 1];
  if (routeType === 'models') return 'lifecyclemodels';
  if (
    routeType === 'processes' ||
    routeType === 'flows' ||
    routeType === 'flowproperties' ||
    routeType === 'unitgroups' ||
    routeType === 'sources' ||
    routeType === 'contacts'
  ) {
    return routeType;
  }
  return 'lifecyclemodels';
};

const classificationText = (value: unknown) => classificationToString(jsonToList(value));

const firstDisplayText = (...values: Array<string | undefined>) =>
  values.find((value) => value && value !== '-') ?? '-';

export type SampleLibraryDisplayFields = {
  name: string;
  generalComment?: string;
  classification: string;
  typeOfDataSet?: string;
  referenceYear?: string;
  location?: string;
  flowType?: string;
  casNumber?: string;
  locationOfSupply?: string;
  referenceUnit?: string;
  quantitativeReference?: string;
  publicationType?: string;
  email?: string;
};

export const extractSampleLibraryDisplayFields = (
  row: SampleLibraryItem,
  type: SampleLibraryDatasetType,
  lang: string,
): SampleLibraryDisplayFields => {
  const content = row.json ?? {};
  if (type === 'lifecyclemodels') {
    const info = content?.lifeCycleModelDataSet?.lifeCycleModelInformation?.dataSetInformation;
    return {
      name: genProcessName(info?.name ?? {}, lang),
      generalComment: getLangText(info?.['common:generalComment'], lang),
      classification: classificationText(
        info?.classificationInformation?.['common:classification']?.['common:class'],
      ),
    };
  }
  if (type === 'processes') {
    const process = content?.processDataSet;
    const information = process?.processInformation;
    const info = information?.dataSetInformation;
    return {
      name: genProcessName(info?.name ?? {}, lang),
      generalComment: getLangText(info?.['common:generalComment'], lang),
      classification: classificationText(
        info?.classificationInformation?.['common:classification']?.['common:class'],
      ),
      typeOfDataSet: process?.modellingAndValidation?.LCIMethodAndAllocation?.typeOfDataSet ?? '-',
      referenceYear: information?.time?.['common:referenceYear'] ?? '-',
      location: information?.geography?.locationOfOperationSupplyOrProduction?.['@location'] ?? '-',
    };
  }
  if (type === 'flows') {
    const flow = content?.flowDataSet;
    const information = flow?.flowInformation;
    const info = information?.dataSetInformation;
    const flowType = flow?.modellingAndValidation?.LCIMethod?.typeOfDataSet;
    const classificationInformation = info?.classificationInformation;
    const classification =
      flowType === 'Elementary flow'
        ? classificationInformation?.['common:elementaryFlowCategorization']?.['common:category']
        : classificationInformation?.['common:classification']?.['common:class'];
    return {
      name: genProcessName(info?.name ?? {}, lang),
      generalComment: getLangText(info?.['common:synonyms'], lang),
      classification: classificationText(classification),
      flowType: flowType ?? '-',
      casNumber: info?.CASNumber ?? '-',
      locationOfSupply: information?.geography?.locationOfSupply ?? '-',
    };
  }
  if (type === 'flowproperties') {
    const information = content?.flowPropertyDataSet?.flowPropertiesInformation;
    const info = information?.dataSetInformation;
    return {
      name: getLangText(info?.['common:name'], lang),
      generalComment: getLangText(info?.['common:generalComment'], lang),
      classification: classificationText(
        info?.classificationInformation?.['common:classification']?.['common:class'],
      ),
      referenceUnit: getLangText(
        information?.quantitativeReference?.referenceToReferenceUnitGroup?.[
          'common:shortDescription'
        ],
        lang,
      ),
    };
  }
  if (type === 'unitgroups') {
    const dataSet = content?.unitGroupDataSet;
    const information = dataSet?.unitGroupInformation;
    const info = information?.dataSetInformation;
    const referenceId = information?.quantitativeReference?.referenceToReferenceUnit;
    const referenceUnit = jsonToList(dataSet?.units?.unit).find(
      (unit: Record<string, unknown>) => unit?.['@dataSetInternalID'] === referenceId,
    );
    return {
      name: getLangText(info?.['common:name'], lang),
      classification: classificationText(
        info?.classificationInformation?.['common:classification']?.['common:class'],
      ),
      quantitativeReference: referenceUnit?.name ?? '-',
    };
  }
  if (type === 'contacts') {
    const info = content?.contactDataSet?.contactInformation?.dataSetInformation;
    return {
      name: firstDisplayText(
        getLangText(info?.['common:shortName'], lang),
        getLangText(info?.['common:name'], lang),
      ),
      generalComment: getLangText(info?.['common:name'], lang),
      classification: classificationText(
        info?.classificationInformation?.['common:classification']?.['common:class'],
      ),
      email: info?.email ?? '-',
    };
  }
  const info = content?.sourceDataSet?.sourceInformation?.dataSetInformation;
  return {
    name: firstDisplayText(getLangText(info?.['common:shortName'], lang), info?.sourceCitation),
    classification: classificationText(
      info?.classificationInformation?.['common:classification']?.['common:class'],
    ),
    publicationType: info?.publicationType ?? '-',
  };
};

export const extractSampleLibraryName = (
  row: SampleLibraryItem,
  type: SampleLibraryDatasetType,
  lang: string,
) => {
  return extractSampleLibraryDisplayFields(row, type, lang).name;
};
