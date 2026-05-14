import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from '../Sparkline';

describe('Sparkline', () => {
  it('returns nothing when data has < 2 points', () => {
    const { container: c1 } = render(<Sparkline data={[]} />);
    expect(c1.querySelector('svg')).toBeNull();

    const { container: c2 } = render(<Sparkline data={[5]} />);
    expect(c2.querySelector('svg')).toBeNull();
  });

  it('renders an svg with the requested width × height', () => {
    const { container } = render(
      <Sparkline data={[1, 2, 3, 4]} width={80} height={30} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('width', '80');
    expect(svg).toHaveAttribute('height', '30');
    expect(svg).toHaveAttribute('viewBox', '0 0 80 30');
  });

  it('emits a stroke path with the color hex for the chosen variant', () => {
    const { container } = render(
      <Sparkline data={[1, 5, 3]} color="purple" />,
    );
    const linePath = container.querySelectorAll('path');
    // No fill: only one path (the stroke line).
    expect(linePath).toHaveLength(1);
    expect(linePath[0]).toHaveAttribute('stroke', '#7a4cf0');
  });

  it('emits a second path + gradient defs when filled=true', () => {
    const { container } = render(
      <Sparkline data={[1, 5, 3]} color="green" filled />,
    );
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(2); // area + line
    const gradient = container.querySelector('linearGradient');
    expect(gradient).toBeTruthy();
    expect(gradient?.id).toBe('sparkGrad-green');
  });

  it('handles a constant series (range 0) without dividing by zero', () => {
    const { container } = render(<Sparkline data={[5, 5, 5, 5]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // The line path should be valid (finite numbers).
    const d = container.querySelector('path')?.getAttribute('d') ?? '';
    expect(d).not.toContain('NaN');
    expect(d).not.toContain('Infinity');
  });

  it('marks the svg aria-hidden (decorative)', () => {
    const { container } = render(<Sparkline data={[1, 2]} />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
