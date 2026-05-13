import { DataLayerView } from '@/components/hub/data-layer/DataLayerView';
import { fetchConnectorRealStates } from '@/lib/connector-state';

export default async function DataLayerPage() {
  const realStates = await fetchConnectorRealStates();
  return <DataLayerView realStates={realStates} />;
}
