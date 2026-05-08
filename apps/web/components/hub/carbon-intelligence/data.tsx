/**
 * Demo data for the Carbon Intelligence module.
 *
 * Carbon Intelligence is a **native** E6.0 module (not embedded). It owns the
 * operational GHG inventory: Scope 1 (direct combustion + fleet), Scope 2
 * (market-based + location-based purchased energy) and Scope 3 categories
 * 1-14 (non-financed value chain — financed emissions live in ALQUID NZ).
 *
 * Replace these mocks with TanStack Query hooks against the future Carbon
 * Intelligence API once the backend is wired up.
 */

export interface MonthlyScopePoint {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
}

/**
 * Monthly tCO₂e per scope, last 12 months. Values intentionally tell a
 * coherent story: Scope 1 stable, Scope 2 dropping (renewable PPA signed
 * in May), Scope 3 dominant and slowly declining.
 */
export const MONTHLY_TREND: MonthlyScopePoint[] = [
  { month: 'Jun', scope1: 42, scope2: 124, scope3: 1840 },
  { month: 'Jul', scope1: 39, scope2: 118, scope3: 1820 },
  { month: 'Aug', scope1: 35, scope2: 101, scope3: 1780 },
  { month: 'Sep', scope1: 38, scope2: 92, scope3: 1810 },
  { month: 'Oct', scope1: 40, scope2: 88, scope3: 1830 },
  { month: 'Nov', scope1: 44, scope2: 80, scope3: 1850 },
  { month: 'Dec', scope1: 46, scope2: 70, scope3: 1900 },
  { month: 'Jan', scope1: 47, scope2: 50, scope3: 1880 },
  { month: 'Feb', scope1: 41, scope2: 32, scope3: 1820 },
  { month: 'Mar', scope1: 38, scope2: 18, scope3: 1740 },
  { month: 'Apr', scope1: 39, scope2: 8, scope3: 1690 },
  { month: 'May', scope1: 38, scope2: 0, scope3: 1660 },
];

/**
 * Total values shown on the KPI row. Numbers must be consistent with the
 * Hub Overview headline (Total GHG = 23,447 tCO₂e).
 */
export const TOTALS = {
  total: 23447,
  scope1: 487,
  scope2MarketBased: 0,
  scope2LocationBased: 1240,
  scope3: 21720,
};

import type { ActivityItem } from '@e60/ui';

export const RECENT_ENTRIES: ActivityItem[] = [
  {
    title: (
      <>
        <strong className="font-semibold">Natural gas</strong> · Madrid HQ heating
      </>
    ),
    sub: 'Scope 1 · DEFRA factor 2.024 kgCO₂e/m³',
    value: '14.2 tCO₂e',
    date: 'today',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Renewable PPA</strong> · 100% allocation
      </>
    ),
    sub: 'Scope 2 (MB) · 0 emissions GoO matched',
    value: '0 tCO₂e',
    date: '06 may',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Business travel</strong> · Q2 air + rail
      </>
    ),
    sub: 'Scope 3.6 · Concur connector',
    value: '386 tCO₂e',
    date: '04 may',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Diesel fleet</strong> · 47 vehicles
      </>
    ),
    sub: 'Scope 1 · MITECO 2025 factor',
    value: '212 tCO₂e',
    date: '02 may',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Purchased goods & services</strong>
      </>
    ),
    sub: 'Scope 3.1 · spend-based EEIO',
    value: '8,420 tCO₂e',
    date: '28 abr',
  },
];

export const ACTIVE_TARGETS: ActivityItem[] = [
  {
    title: (
      <>
        <strong className="font-semibold">Net Zero own-ops 2030</strong>
      </>
    ),
    sub: 'Scope 1 + 2 · SBTi 1.5°C aligned',
    value: '−42% YTD',
    date: 'on track',
  },
  {
    title: (
      <>
        <strong className="font-semibold">100% renewable electricity</strong>
      </>
    ),
    sub: 'RE100 · all sites by 2026',
    value: '100%',
    date: 'achieved',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Fleet electrification</strong>
      </>
    ),
    sub: '50% EV by 2027 · current 18%',
    value: '18%',
    date: 'lag −9pp',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Scope 3 supplier engagement</strong>
      </>
    ),
    sub: 'Top 80% spend with SBTi targets',
    value: '64%',
    date: 'on track',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Business travel cap</strong>
      </>
    ),
    sub: '−30% vs 2019 baseline',
    value: '−24%',
    date: '2025 H1',
  },
];

export const VALIDATION_QUEUE: ActivityItem[] = [
  {
    title: (
      <>
        <strong className="font-semibold">Refrigerants leak (R-410A)</strong>
      </>
    ),
    sub: 'Scope 1 · GWP 2,088 · facilities team',
    value: '4.8 tCO₂e',
    date: 'pending',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Capital goods</strong> · datacentre upgrade
      </>
    ),
    sub: 'Scope 3.2 · awaiting LCA from vendor',
    value: '1,240 tCO₂e',
    date: '−5d',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Employee commuting</strong> · survey 2025
      </>
    ),
    sub: 'Scope 3.7 · 78% response rate',
    value: '320 tCO₂e',
    date: 'review',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Waste & water</strong> · Q1 close
      </>
    ),
    sub: 'Scope 3.5 · operational waste',
    value: '46 tCO₂e',
    date: '−2d',
  },
  {
    title: (
      <>
        <strong className="font-semibold">Upstream T&D losses</strong>
      </>
    ),
    sub: 'Scope 3.3 · grid-mix recalc',
    value: '24 tCO₂e',
    date: 'review',
  },
];

export const FEED_DATAPOINTS = [
  { code: 'E1-6_01', description: 'Gross Scopes 1, 2, 3 and Total GHG emissions · own operations' },
  { code: 'E1-6_02', description: 'Scope 1 emissions · direct combustion + fleet' },
  { code: 'E1-6_03', description: 'Scope 2 (location-based) emissions · purchased energy' },
  { code: 'E1-6_04', description: 'Scope 2 (market-based) emissions · purchased energy' },
  { code: 'E1-6_07', description: 'Scope 3 categories 1-14 · non-financed value chain' },
  { code: 'E1-7_01', description: 'Carbon removals achieved · own operations (verified)' },
  { code: 'E1-5_01', description: 'Energy consumption from non-renewable sources' },
  { code: 'E1-5_05', description: 'Share of renewable energy in total energy mix' },
];
