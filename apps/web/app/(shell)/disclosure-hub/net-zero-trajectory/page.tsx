import { EngineEmbed } from '@/components/embeds/EngineEmbed';

export default function NetZeroTrajectoryPage() {
  return (
    <EngineEmbed
      engine="alquid-nz"
      view="net-zero-trajectory"
      title="Net Zero Trajectory"
      subtitle="SBTi-FI v2 · NZBA · NGFS / IEA NZE scenarios · ITR portfolio"
      viewLabel="Net-Zero trajectory · SBTi 1.5°C"
      metaPill="annual cycle · 2025 review pending"
      feeds={[
        { code: 'E1-1_03', description: 'Description of transition plan and intermediate targets (ESRS E1-1)' },
        { code: 'E1-4_03', description: 'Decarbonisation targets aligned with 1.5°C pathway (financed)' },
        { code: 'E1-4_04', description: 'Implied Temperature Rise of the financed portfolio' },
        { code: 'E1-1_12', description: 'Investments and CapEx aligned with the transition plan' },
        { code: 'TBL_1', description: 'EBA Pillar III ESG · Banking book exposures aligned with transition' },
      ]}
    />
  );
}
