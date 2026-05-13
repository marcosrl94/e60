import { notFound } from 'next/navigation';
import type { Datapoint } from '@e60/domain';
import seed from '@/data/seed/datapoints.json';
import { applyDemoOverlay } from '@/components/hub/repository/demo-overlay';
import { DISCLOSURES } from '@/components/hub/outputs/data';
import { DISCLOSURE_DATAPOINTS } from '@/components/hub/outputs/disclosure-datapoint-mapping';
import { DisclosurePreviewView } from '@/components/hub/outputs/DisclosurePreviewView';

const OVERLAYED = applyDemoOverlay(seed as unknown as Datapoint[]);
const BY_ID = new Map(OVERLAYED.map((dp) => [dp.id, dp] as const));

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DisclosurePreviewPage({ params }: PageProps) {
  const { id } = await params;
  const disclosure = DISCLOSURES.find((d) => d.id === id);
  if (!disclosure) notFound();
  const ids = DISCLOSURE_DATAPOINTS[id] ?? [];
  const datapoints = ids
    .map((dpId) => BY_ID.get(dpId))
    .filter((dp): dp is Datapoint => !!dp);
  return (
    <DisclosurePreviewView disclosure={disclosure} datapoints={datapoints} />
  );
}
