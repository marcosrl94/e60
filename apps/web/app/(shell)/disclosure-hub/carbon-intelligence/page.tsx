import { CarbonIntelligenceView } from '@/components/hub/carbon-intelligence/CarbonIntelligenceView';

interface PageProps {
  searchParams: Promise<{ disclosure?: string | string[] }>;
}

export default async function CarbonIntelligencePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.disclosure) ? sp.disclosure[0] : sp.disclosure;
  return <CarbonIntelligenceView disclosureFilter={raw ?? null} />;
}
