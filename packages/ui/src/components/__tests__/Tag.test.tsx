import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tag } from '../Tag';

describe('Tag', () => {
  it('renders its children', () => {
    render(<Tag variant="green">Live</Tag>);
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('applies the variant palette class for green', () => {
    render(<Tag variant="green">Live</Tag>);
    const el = screen.getByText('Live');
    expect(el).toHaveClass('bg-nfq-greenBg');
    expect(el).toHaveClass('text-nfq-green');
  });

  it('applies a different palette per variant', () => {
    const { rerender } = render(<Tag variant="red">Blocked</Tag>);
    expect(screen.getByText('Blocked')).toHaveClass('text-nfq-red');

    rerender(<Tag variant="purple">Voluntary</Tag>);
    expect(screen.getByText('Voluntary')).toHaveClass('text-nfq-purple');
  });

  it('preserves a custom className via the cn merger', () => {
    render(
      <Tag variant="gray" className="ml-2 tracking-tight">
        +2y
      </Tag>,
    );
    const el = screen.getByText('+2y');
    expect(el).toHaveClass('ml-2');
    // Base classes still present.
    expect(el).toHaveClass('inline-block');
  });

  it('renders ReactNode children, not just strings', () => {
    render(
      <Tag variant="blue">
        <span data-testid="inner">12</span> shown
      </Tag>,
    );
    expect(screen.getByTestId('inner')).toHaveTextContent('12');
  });
});
