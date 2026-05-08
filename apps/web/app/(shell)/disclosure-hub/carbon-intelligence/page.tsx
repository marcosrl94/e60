import { EngineEmbed } from '@/components/embeds/EngineEmbed';

export default function CarbonIntelligencePage() {
  return (
    <EngineEmbed
      engine="carbon-intelligence"
      view="overview"
      title="Carbon Intelligence"
      subtitle="GHG inventory · Scope 1 + 2 (LB / MB) + Scope 3 non-financed · own operations"
      viewLabel="Carbon Intelligence · GHG inventory"
      metaPill="GHG Protocol Corporate · ISO 14064-1"
      feeds={[
        { code: 'E1-6_01', description: 'Gross Scopes 1, 2, 3 and Total GHG emissions · own operations' },
        { code: 'E1-6_02', description: 'Scope 1 emissions · direct combustion + fleet' },
        { code: 'E1-6_03', description: 'Scope 2 (location-based) emissions · purchased energy' },
        { code: 'E1-6_04', description: 'Scope 2 (market-based) emissions · purchased energy' },
        { code: 'E1-6_07', description: 'Scope 3 categories 1-14 · non-financed value chain' },
        { code: 'E1-7_01', description: 'Carbon removals achieved · own operations (verified)' },
        { code: 'E1-7_02', description: 'GHG removal and storage projects · methodology disclosure' },
        { code: 'E1-5_01', description: 'Energy consumption and intensity from non-renewable sources' },
        { code: 'E1-5_05', description: 'Share of renewable energy in total energy mix' },
      ]}
    />
  );
}
