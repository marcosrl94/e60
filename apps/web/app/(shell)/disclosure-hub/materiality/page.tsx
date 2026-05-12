import { MaterialityView } from '@/components/hub/materiality/MaterialityView';

export default async function MaterialityPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  return <MaterialityView period={params.period} />;
}
