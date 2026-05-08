import { EngineEmbed } from '@/components/embeds/EngineEmbed';

export default function CbamPage() {
  return (
    <EngineEmbed
      engine="cbam"
      view="overview"
      title="CBAM"
      subtitle="Carbon Border Adjustment Mechanism · cement · iron+steel · aluminium · fertilisers · electricity · hydrogen"
      viewLabel="Embedded emissions in covered imports"
      metaPill="Q4 2025 · transitional → definitive 2026"
      feeds={[
        { code: 'CBAM_R-1', description: 'Embedded emissions of covered imports (tCO₂e per CN8 code)' },
        { code: 'CBAM_R-2', description: 'CBAM certificate exposure (€) and surrendering schedule' },
        { code: 'CBAM_R-3', description: 'Indirect emissions of covered imports (electricity input)' },
        { code: 'E1-9_02', description: 'Anticipated financial effects of transition risks (CBAM exposure leg)' },
        { code: 'TBL_5', description: 'EBA Pillar III ESG · physical + transition risk to CBAM-exposed counterparties' },
      ]}
    />
  );
}
