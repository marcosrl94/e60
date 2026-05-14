import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FrameworkChip } from '../FrameworkChip';

describe('FrameworkChip', () => {
  it('renders the framework label', () => {
    render(<FrameworkChip framework="CSRD" />);
    expect(screen.getByText('CSRD')).toBeInTheDocument();
  });

  it('merges custom className with the base chrome', () => {
    render(<FrameworkChip framework="GRI 305" className="bg-nfq-blueBg" />);
    const el = screen.getByText('GRI 305');
    expect(el).toHaveClass('bg-nfq-blueBg');
    expect(el).toHaveClass('inline-flex'); // base still present
  });

  it('uses mono font + uppercase tracking for the chip body', () => {
    render(<FrameworkChip framework="CDP C6.1" />);
    const el = screen.getByText('CDP C6.1');
    expect(el).toHaveClass('font-mono');
  });
});
