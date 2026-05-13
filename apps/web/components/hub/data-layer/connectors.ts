/**
 * Connector catalogue · seed for the Data Layer stub.
 *
 * Eventually backed by a `connectors` table (one row per configured
 * source-system per org). Until then this file is the source of truth
 * the UI renders — categories, expected providers, and a plausible
 * status mix so demos look real.
 *
 * `lastSyncOffsetMin` is an offset from "now at render time" so a
 * server-rendered page always looks fresh whatever day it is opened.
 * `recordsIngested` is a cumulative-since-onboarding figure (not a
 * delta), shown in human-readable form by the card formatter.
 */

export type ConnectorStatus =
  | 'connected'
  | 'partial'
  | 'error'
  | 'not_connected';

export type ConnectorCategory =
  | 'hr_people'
  | 'erp_finance'
  | 'banking_core'
  | 'esg_providers'
  | 'climate_hazard'
  | 'emission_factors'
  | 'manual_upload';

export interface Connector {
  /** Stable slug used as React key and for future Configure routes. */
  id: string;
  /** Display name (vendor product / dataset). */
  name: string;
  /** Vendor or maintaining institution. */
  vendor: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  /** Two-letter mark shown inside the colored avatar square. */
  initials: string;
  /** Background tone for the avatar square. */
  tone: 'blue' | 'orange' | 'green' | 'purple' | 'red';
  /** One-line description of what this connector brings into the platform. */
  blurb: string;
  /** Minutes-ago at render time. Null when status is `not_connected`. */
  lastSyncOffsetMin: number | null;
  /** Total rows ingested since onboarding. Null when not connected. */
  recordsIngested: number | null;
  /** Optional one-line note shown beneath the metrics row (e.g. error reason). */
  note?: string;
  /**
   * When true the connector reads its live state (last_sync_at, status,
   * records_ingested) from the `connector_syncs` Supabase table for the
   * current user, instead of using the demo values baked into this seed.
   * The Configure button is enabled and opens a real flow.
   */
  realState?: boolean;
}

export const CATEGORY_LABEL: Record<ConnectorCategory, string> = {
  manual_upload: 'Manual upload',
  hr_people: 'HR & People',
  erp_finance: 'ERP & Finance',
  banking_core: 'Banking core',
  esg_providers: 'ESG data providers',
  climate_hazard: 'Climate & hazard data',
  emission_factors: 'Emission factor libraries',
};

export const CATEGORY_ORDER: ConnectorCategory[] = [
  'manual_upload',
  'banking_core',
  'erp_finance',
  'hr_people',
  'esg_providers',
  'climate_hazard',
  'emission_factors',
];

export const PORTFOLIO_CSV_CONNECTOR_ID = 'portfolio-csv-upload';

export const CONNECTORS: Connector[] = [
  // ── Manual upload (REAL · backed by connector_syncs)
  {
    id: PORTFOLIO_CSV_CONNECTOR_ID,
    name: 'Portfolio CSV upload',
    vendor: 'E6.0 native',
    category: 'manual_upload',
    initials: 'CSV',
    tone: 'purple',
    status: 'not_connected',
    blurb:
      'Drag a portfolio extract (CSV) · auto-mapped to PCAF-min schema · counts + raw file persisted per ingest.',
    lastSyncOffsetMin: null,
    recordsIngested: null,
    realState: true,
  },

  // ── Banking core
  {
    id: 'temenos-t24',
    name: 'Temenos T24',
    vendor: 'Temenos',
    category: 'banking_core',
    initials: 'TT',
    tone: 'red',
    status: 'connected',
    blurb:
      'Portfolio extraction · borrower master · exposure-at-default · sector NACE.',
    lastSyncOffsetMin: 22,
    recordsIngested: 1_842_117,
  },
  {
    id: 'finastra-fusion',
    name: 'Finastra Fusion',
    vendor: 'Finastra',
    category: 'banking_core',
    initials: 'FF',
    tone: 'red',
    status: 'partial',
    blurb:
      'Loan book + collateral · 11 of 14 product lines mapped · 3 awaiting taxonomy.',
    lastSyncOffsetMin: 124,
    recordsIngested: 612_904,
    note: '3 product lines awaiting NACE/EU Taxonomy mapping',
  },
  {
    id: 'fiserv-dna',
    name: 'Fiserv DNA',
    vendor: 'Fiserv',
    category: 'banking_core',
    initials: 'FD',
    tone: 'red',
    status: 'not_connected',
    blurb: 'Retail banking core · planned Q3 2026 onboarding.',
    lastSyncOffsetMin: null,
    recordsIngested: null,
  },

  // ── ERP & Finance
  {
    id: 'sap-s4hana',
    name: 'SAP S/4HANA',
    vendor: 'SAP',
    category: 'erp_finance',
    initials: 'S4',
    tone: 'blue',
    status: 'connected',
    blurb:
      'GL postings · cost centres · vendor master · activity-based emissions allocation.',
    lastSyncOffsetMin: 9,
    recordsIngested: 3_201_558,
  },
  {
    id: 'oracle-ebs',
    name: 'Oracle EBS',
    vendor: 'Oracle',
    category: 'erp_finance',
    initials: 'OE',
    tone: 'orange',
    status: 'error',
    blurb: 'Legacy GL · ageing 11g instance · pulled nightly via DB link.',
    lastSyncOffsetMin: 2_640,
    recordsIngested: 198_213,
    note: 'ORA-12541 listener offline since 18:42 yesterday',
  },
  {
    id: 'netsuite',
    name: 'NetSuite',
    vendor: 'Oracle',
    category: 'erp_finance',
    initials: 'NS',
    tone: 'blue',
    status: 'connected',
    blurb: 'Subsidiary ledgers · multi-currency · suite of EU branches.',
    lastSyncOffsetMin: 47,
    recordsIngested: 421_775,
  },

  // ── HR & People
  {
    id: 'workday',
    name: 'Workday HCM',
    vendor: 'Workday',
    category: 'hr_people',
    initials: 'WD',
    tone: 'orange',
    status: 'connected',
    blurb:
      'Headcount · pay equity · diversity · S1 social datapoints feed.',
    lastSyncOffsetMin: 65,
    recordsIngested: 28_402,
  },
  {
    id: 'sap-successfactors',
    name: 'SAP SuccessFactors',
    vendor: 'SAP',
    category: 'hr_people',
    initials: 'SF',
    tone: 'blue',
    status: 'partial',
    blurb: 'Employee master · training · feeds ESRS S1-13 / S1-14.',
    lastSyncOffsetMin: 480,
    recordsIngested: 14_998,
    note: 'EMEA region fine · APAC stale (>8h)',
  },

  // ── ESG data providers
  {
    id: 'msci-esg',
    name: 'MSCI ESG Ratings',
    vendor: 'MSCI',
    category: 'esg_providers',
    initials: 'MS',
    tone: 'blue',
    status: 'connected',
    blurb:
      'Counterparty ESG scores · controversies · used in screening + financed-emissions weighting.',
    lastSyncOffsetMin: 12,
    recordsIngested: 78_421,
  },
  {
    id: 'sustainalytics',
    name: 'Sustainalytics',
    vendor: 'Morningstar',
    category: 'esg_providers',
    initials: 'SU',
    tone: 'green',
    status: 'connected',
    blurb: 'Risk ratings · ESRS gap analysis · second-opinion source.',
    lastSyncOffsetMin: 35,
    recordsIngested: 52_009,
  },
  {
    id: 'iss-esg',
    name: 'ISS ESG',
    vendor: 'ISS',
    category: 'esg_providers',
    initials: 'IS',
    tone: 'purple',
    status: 'not_connected',
    blurb: 'Norm-based screening · controversies · added Q3 if customer demand.',
    lastSyncOffsetMin: null,
    recordsIngested: null,
  },

  // ── Climate & hazard data
  {
    id: 'climate-x',
    name: 'Climate X',
    vendor: 'Climate X',
    category: 'climate_hazard',
    initials: 'CX',
    tone: 'orange',
    status: 'connected',
    blurb:
      'Physical risk scoring (flood · wildfire · drought · sea-level) per address · IPCC scenarios.',
    lastSyncOffsetMin: 180,
    recordsIngested: 91_204,
  },
  {
    id: 'nasa-nex-gddp',
    name: 'NASA NEX-GDDP-CMIP6',
    vendor: 'NASA',
    category: 'climate_hazard',
    initials: 'NX',
    tone: 'blue',
    status: 'connected',
    blurb: 'Downscaled climate projections · open dataset · feeds scenario module.',
    lastSyncOffsetMin: 1_445,
    recordsIngested: 18_311,
  },
  {
    id: 'osm-geocoder',
    name: 'OSM Nominatim',
    vendor: 'OpenStreetMap',
    category: 'climate_hazard',
    initials: 'OM',
    tone: 'green',
    status: 'connected',
    blurb: 'Address → lat/lon geocoding for collateral & operations.',
    lastSyncOffsetMin: 4,
    recordsIngested: 246_018,
  },

  // ── Emission factor libraries
  {
    id: 'defra-uk',
    name: 'DEFRA GHG conversion factors',
    vendor: 'UK Gov',
    category: 'emission_factors',
    initials: 'DE',
    tone: 'green',
    status: 'connected',
    blurb: 'Annual UK conversion factors — anchor for Scope 1+2+3 calculations.',
    lastSyncOffsetMin: 30 * 1440,
    recordsIngested: 5_412,
  },
  {
    id: 'iea',
    name: 'IEA emission factors',
    vendor: 'IEA',
    category: 'emission_factors',
    initials: 'IE',
    tone: 'blue',
    status: 'connected',
    blurb: 'Country-level grid factors · used in market-based Scope 2.',
    lastSyncOffsetMin: 12 * 1440,
    recordsIngested: 894,
  },
  {
    id: 'miteco-idae',
    name: 'MITECO/IDAE',
    vendor: 'Gov España',
    category: 'emission_factors',
    initials: 'MI',
    tone: 'red',
    status: 'connected',
    blurb: 'Factores oficiales España · obligatorio para reporting CNMV.',
    lastSyncOffsetMin: 7 * 1440,
    recordsIngested: 1_277,
  },
  {
    id: 'epa-us',
    name: 'EPA emission factors',
    vendor: 'US EPA',
    category: 'emission_factors',
    initials: 'EP',
    tone: 'orange',
    status: 'partial',
    blurb: 'US factors · used by US-domiciled exposures · last refresh delayed.',
    lastSyncOffsetMin: 42 * 1440,
    recordsIngested: 2_106,
    note: 'EPA mid-2026 refresh still pending upstream',
  },
];

export interface ConnectorMetrics {
  total: number;
  connected: number;
  partial: number;
  error: number;
  notConnected: number;
  /** Records ingested across all live connectors (cumulative). */
  recordsTotal: number;
  /** Most recent sync across all connectors, in minutes-ago. */
  freshestSyncMin: number | null;
  /** Oldest non-error sync across connected/partial connectors. */
  stalestSyncMin: number | null;
}

export function computeConnectorMetrics(rows: Connector[]): ConnectorMetrics {
  let connected = 0;
  let partial = 0;
  let error = 0;
  let notConnected = 0;
  let recordsTotal = 0;
  let freshest: number | null = null;
  let stalest: number | null = null;
  for (const r of rows) {
    if (r.status === 'connected') connected++;
    else if (r.status === 'partial') partial++;
    else if (r.status === 'error') error++;
    else notConnected++;
    if (r.recordsIngested) recordsTotal += r.recordsIngested;
    if (r.lastSyncOffsetMin != null && r.status !== 'error') {
      if (freshest == null || r.lastSyncOffsetMin < freshest)
        freshest = r.lastSyncOffsetMin;
      if (stalest == null || r.lastSyncOffsetMin > stalest)
        stalest = r.lastSyncOffsetMin;
    }
  }
  return {
    total: rows.length,
    connected,
    partial,
    error,
    notConnected,
    recordsTotal,
    freshestSyncMin: freshest,
    stalestSyncMin: stalest,
  };
}
