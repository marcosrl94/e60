/**
 * Disclosure narrative templates.
 *
 * Curated prose with `{{<datapoint_id>}}` placeholders that the
 * preview view replaces with the captured value (formatted with unit)
 * or a red `[id]` chip when no value is available. One template per
 * disclosure in `DISCLOSURES`; a missing entry renders an empty
 * narrative pane (placeholder copy).
 *
 * Markdown-lite:
 *   · paragraphs are separated by a blank line.
 *   · a line starting with `## ` becomes a `<h2>` heading.
 *   · a line starting with `### ` becomes a `<h3>` subheading.
 */

export const NARRATIVES: Record<string, string> = {
  csrd: `## ESRS 2 · General disclosures

The Group's strategy and business model in relation to sustainability is set out in {{SBM-1_01}}, and the material impacts, risks and opportunities are summarised in {{SBM-3_01}}. Governance arrangements covering ESG matters are described in {{GOV-1_01}} and {{GOV-2_01}}.

## ESRS E1 · Climate change

The transition plan disclosed in {{E1-1_01}} commits the Group to net-zero by 2050, with intermediate targets aligned with a 1.5°C pathway. Climate-related actions and resources are detailed in {{E1-3_01}} and {{E1-4_01}}.

Energy consumption captured under {{E1-5_01}} totalled the reporting-period figure shown. Gross greenhouse gas emissions for the period reached {{E1-6_01}}, with location-based Scope 2 at {{E1-6_02}}; GHG removals reached {{E1-7_01}}. Anticipated financial effects from material physical and transition risks are quantified in {{E1-9_01}}.

## ESRS S1 · Own workforce

Material impacts on the workforce are described in {{S1.SBM-3_01}}. Diversity-related disclosures appear in {{S1-9_01}} and training metrics in {{S1-14_01}}.

## ESRS G1 · Business conduct

Anti-corruption and anti-bribery policies are covered in {{G1-1_01}}, with confirmed incidents reported in {{G1-3_01}}.`,

  cdp: `## CDP Climate Change 2025

### C2 · Risks and opportunities

Climate-related governance arrangements are described in {{GOV-1_01}}. The material impacts, risks and opportunities captured during this assessment are set out in {{SBM-3_01}}, consistent with the climate transition actions disclosed under {{E1-3_01}}.

### C4 · Targets and performance

The Group's net-zero transition plan ({{E1-1_01}}) commits to a 1.5°C-aligned pathway with intermediate milestones described in {{E1-4_01}}.

### C6 · Emissions data

Gross Scope 1, 2 and 3 emissions disclosed under {{E1-6_01}} totalled the figure shown. Location-based Scope 2 contributed {{E1-6_02}}. Anticipated financial effects from climate risks are quantified in {{E1-9_01}}.`,

  pillar3: `## EBA Pillar III ESG · Q4 2025

### Template 1 · Banking book — credit quality of GHG-intensive exposures

The institution's climate transition plan and stated reduction targets disclosed under {{E1-1_01}} and {{E1-4_01}} frame the Pillar III ESG response. The exposure-weighted gross emissions associated with the credit portfolio are reported following the methodology of {{E1-6_01}}.

### Template 5 · Anticipated financial effects from physical and transition risk

Climate-related anticipated financial effects on the balance sheet are quantified in {{E1-9_01}}, consistent with EBA guidance on consistent methodology with CSRD/ESRS disclosures.`,

  djsi: `## DJSI / S&P CSA — Banks industry

### Governance dimension

The Group's ESG governance is described in {{GOV-1_01}} and {{GOV-2_01}}; anti-corruption policies under {{G1.GOV-1_01}} and {{G1-1_01}}.

### Environmental dimension

The Group's transition plan ({{E1-1_01}}) and targets ({{E1-4_01}}) detail the path to net-zero. Operational footprint per {{E1-6_01}} is reported on a market-based basis.

### Social dimension

Workforce-related disclosures appear in {{S1-9_01}} (diversity) and {{S1-14_01}} (training).`,

  prb: `## UNEP-FI Principles for Responsible Banking · annual self-assessment

### Principle 2 · Impact and target setting

The bank's transition plan, summarised under {{E1-1_01}}, identifies climate as a most-significant area of impact. Targets and milestones are recorded in {{E1-4_01}}; operational emissions reported under {{E1-6_01}}.

### Principle 4 · Stakeholder engagement

Governance arrangements covering stakeholder engagement on sustainability are described in {{GOV-1_01}} and {{SBM-1_01}}.

### Principle 6 · Transparency

Diversity and inclusion in the bank's own workforce are reported in {{S1-9_01}}.`,

  board: `## Board ESG dashboard · top-level

The Group's operational greenhouse gas emissions for the reporting period reached {{E1-6_01}}, in line with the trajectory set under {{E1-4_01}}.

Workforce diversity ({{S1-9_01}}) and training ({{S1-14_01}}) progressed during the period. The anti-corruption framework ({{G1-1_01}}) remains effective with no material incidents.`,
};
