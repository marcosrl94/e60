import { CarbonIntelligenceView } from '@/components/hub/carbon-intelligence/CarbonIntelligenceView';

interface PageProps {
  searchParams: Promise<{
    disclosure?: string | string[];
    location?: string | string[];
  }>;
}

function pickOne(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

export default async function CarbonIntelligencePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  return (
    <CarbonIntelligenceView
      disclosureFilter={pickOne(sp.disclosure)}
      locationFilter={pickOne(sp.location)}
    />
  );
}
