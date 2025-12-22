import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with default variant and size', () => {
    render(<Button>Default Button</Button>);
    const button = screen.getByRole('button', { name: 'Default Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-9', 'px-4', 'py-2');
  });

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Destructive</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive', 'text-white');
  });

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'bg-background', 'shadow-xs');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground');
  });

  it('renders with link variant', () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'px-3');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'px-6');

    rerender(<Button size="icon">Icon</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('size-9');

    rerender(<Button size="icon-sm">Icon Small</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('size-8');

    rerender(<Button size="icon-lg">Icon Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('size-10');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('renders as different element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('passes through additional props', () => {
    render(<Button data-testid="custom-button" disabled={false}>Test</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders with children containing SVG icons', () => {
    render(
      <Button>
        <svg data-testid="test-icon"></svg>
        With Icon
      </Button>
    );
    
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('test-icon');
    
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(button).toHaveClass('[&:has(>svg)]:px-3');
  });
});