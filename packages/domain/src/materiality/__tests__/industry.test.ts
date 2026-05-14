import { describe, it, expect } from 'vitest';
import {
  resolveMateriality,
  type IndustryMateriality,
  type OrgMaterialityOverride,
} from '../industry';

const im = (
  sectorCode: string,
  scopeCategory: IndustryMateriality['scopeCategory'],
  materiality: IndustryMateriality['materiality'],
  sourceFramework: IndustryMateriality['sourceFramework'],
  notes: string | null = null,
): IndustryMateriality => ({
  sectorCode,
  scopeCategory,
  materiality,
  sourceFramework,
  notes,
});

const override = (
  sectorCode: string,
  scopeCategory: OrgMaterialityOverride['scopeCategory'],
  materiality: OrgMaterialityOverride['materiality'],
  justification: string,
): OrgMaterialityOverride => ({
  sectorCode,
  scopeCategory,
  materiality,
  justification,
  setAt: '2026-05-14T10:00:00Z',
});

describe('resolveMateriality', () => {
  it('returns level 0 + source inherit when nothing matches', () => {
    const r = resolveMateriality('Z.99', 's1', [], []);
    expect(r.level).toBe(0);
    expect(r.source).toBe('inherit');
    expect(r.resolvedFrom).toBeDefined();
  });

  it('returns the override regardless of catalog content', () => {
    const catalog = [im('C.10', 's1', 2, 'EFRAG_ESRS')];
    const overrides = [override('C.10', 's1', 3, 'Bank pilot override')];
    const r = resolveMateriality('C.10', 's1', catalog, overrides);
    expect(r.level).toBe(3);
    expect(r.source).toBe('override');
    expect(r.notes).toBe('Bank pilot override');
  });

  it('returns the direct match when no override exists', () => {
    const catalog = [im('K.64', 's1', 2, 'EFRAG_ESRS')];
    const r = resolveMateriality('K.64', 's1', catalog, []);
    expect(r.level).toBe(2);
    expect(r.source).toBe('EFRAG_ESRS');
  });

  it('prefers EFRAG_ESRS over GHG / SASB / NFQ on a direct match', () => {
    const catalog = [
      im('K.64', 's1', 1, 'SASB'),
      im('K.64', 's1', 3, 'NFQ_internal'),
      im('K.64', 's1', 2, 'EFRAG_ESRS'),
      im('K.64', 's1', 2, 'GHG_Protocol'),
    ];
    const r = resolveMateriality('K.64', 's1', catalog, []);
    expect(r.source).toBe('EFRAG_ESRS');
    expect(r.level).toBe(2);
  });

  it('falls back to the parent section when the division has no rule', () => {
    const catalog = [im('K', 's1', 1, 'EFRAG_ESRS')];
    const r = resolveMateriality('K.64', 's1', catalog, []);
    expect(r.level).toBe(1);
    // Parent-fallback uses source 'inherit' so the UI can distinguish "this
    // came from the parent section" from "this is a direct framework rule".
    expect(r.source).toBe('inherit');
    expect(r.resolvedFrom).toBe('K');
  });

  it('returns level 0 when neither the division nor the parent match', () => {
    const catalog = [im('A', 's1', 2, 'EFRAG_ESRS')];
    const r = resolveMateriality('K.64', 's1', catalog, []);
    expect(r.level).toBe(0);
    expect(r.source).toBe('inherit');
  });
});
