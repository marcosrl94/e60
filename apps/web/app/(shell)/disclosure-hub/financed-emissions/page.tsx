import { AlquidEmbed } from '@/components/embeds/AlquidEmbed';

export default function FinancedEmissionsPage() {
  return (
    <AlquidEmbed
      view="financed-emissions"
      title="Financed Emissions"
      subtitle="PCAF v3 · banking book · 487 corporate counterparties"
      metaPill="Q4 2025 · last calc 14:23"
      feeds={[
        { code: 'E1-6_05', description: 'Financed emissions (Scope 3.15) · banking book' },
        { code: 'E1-6_06', description: 'PCAF data quality score by asset class' },
        { code: 'E1-6_08', description: 'GHG emissions intensity per €M of EAD' },
        { code: 'E1-1_12', description: 'Transition plan implementation progress (Pillar III TBL 1)' },
        { code: 'E1-9_02', description: 'Anticipated financial effects of transition risks' },
      ]}
    />
  );
}
