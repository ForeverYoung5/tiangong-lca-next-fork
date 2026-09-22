import ContactView from '@/pages/Contacts/Components/view';
import FlowpropertyView from '@/pages/Flowproperties/Components/view';
import FlowsView from '@/pages/Flows/Components/view';
import LifeCycleModelView from '@/pages/LifeCycleModels/Components/view';
import ProcessView from '@/pages/Processes/Components/view';
import SourceView from '@/pages/Sources/Components/view';
import UnitgroupView from '@/pages/Unitgroups/Components/view';
import type { SampleLibraryDatasetType, SampleLibraryItem } from '@/services/sampleLibrary/api';

export default function SampleLibraryDetailButton({
  type,
  row,
  lang,
}: {
  type: SampleLibraryDatasetType;
  row: SampleLibraryItem;
  lang: string;
}) {
  const props = { id: row.id, version: row.version, lang, buttonType: 'icon' };
  switch (type) {
    case 'lifecyclemodels':
      return <LifeCycleModelView {...props} />;
    case 'processes':
      return <ProcessView {...props} disabled={false} />;
    case 'flows':
      return <FlowsView {...props} />;
    case 'flowproperties':
      return <FlowpropertyView {...props} />;
    case 'unitgroups':
      return <UnitgroupView {...props} />;
    case 'sources':
      return <SourceView {...props} />;
    case 'contacts':
      return <ContactView {...props} />;
  }
}
