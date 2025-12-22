import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>Test Badge</Badge>);
    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground');
  });

  it('renders with secondary variant', () => {
    render(<Badge variant="secondary">Secondary Badge</Badge>);
    const badge = screen.getByText('Secondary Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground');
  });

  it('renders with destructive variant', () => {
    render(<Badge variant="destructive">Destructive Badge</Badge>);
    const badge = screen.getByText('Destructive Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground');
  });

  it('renders with outline variant', () => {
    render(<Badge variant="outline">Outline Badge</Badge>);
    const badge = screen.getByText('Outline Badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-foreground');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>);
    const badge = screen.getByText('Custom Badge');
    expect(badge).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(<Badge data-testid="custom-badge">Test</Badge>);
    const badge = screen.getByTestId('custom-badge');
    expect(badge).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Badge onClick={handleClick}>Clickable Badge</Badge>);
    const badge = screen.getByText('Clickable Badge');
    badge.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});