'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

/**
 * Button variant styles using class-variance-authority
 * Designed for educational contexts with WCAG 2.1 AA compliance
 */
const buttonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-colors',
    // Accessibility
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    // Disabled state
    'disabled:pointer-events-none disabled:opacity-50',
    // Reduced motion
    'motion-reduce:transition-none',
    // High contrast mode
    'forced-colors:border-[ButtonBorder] forced-colors:text-[ButtonText]',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500',
        outline: [
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          'focus-visible:ring-primary',
        ],
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground focus-visible:ring-primary',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
        // Educational specific variants
        success: 'bg-success-500 text-white hover:bg-success-600 focus-visible:ring-success-500',
        warning: 'bg-warning-500 text-white hover:bg-warning-600 focus-visible:ring-warning-500',
        // Grade-level themed variants
        elementary: 'bg-education-primary-500 text-white hover:bg-education-primary-600',
        middle: 'bg-education-secondary-500 text-white hover:bg-education-secondary-600', 
        high: 'bg-education-tertiary-500 text-white hover:bg-education-tertiary-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-7 rounded px-2 text-xs',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        // Touch-friendly sizes for younger students
        touch: 'h-12 px-6 text-base min-w-[88px]', // Meets WCAG touch target size
        'touch-lg': 'h-14 px-8 text-lg min-w-[100px]',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      // Educational context styling
      context: {
        default: '',
        assessment: 'font-semibold tracking-wide',
        navigation: 'font-medium',
        action: 'font-bold shadow-md hover:shadow-lg',
        subtle: 'font-normal opacity-90 hover:opacity-100',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      context: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child component (useful for custom components) */
  asChild?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  leftIcon?: React.ReactNode;
  /** Icon to display after text */
  rightIcon?: React.ReactNode;
  /** Educational grade level for automatic theming */
  gradeLevel?: 'k5' | '68' | '912';
}

/**
 * Educational Button Component
 * 
 * Accessible button component designed for educational platforms with:
 * - WCAG 2.1 AA compliance
 * - Touch-friendly sizes for younger students
 * - Grade-level appropriate styling
 * - Loading states and icons
 * - Keyboard navigation support
 * 
 * @example
 * ```tsx
 * // Basic button
 * <Button>Click me</Button>
 * 
 * // Grade-level themed
 * <Button variant="elementary" size="touch" gradeLevel="k5">
 *   Start Activity
 * </Button>
 * 
 * // With icons and loading
 * <Button leftIcon={<PlayIcon />} loading={isLoading}>
 *   Begin Assessment
 * </Button>
 * 
 * // Touch-friendly for tablets
 * <Button size="touch-lg" context="action">
 *   Submit Answer
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant, 
      size, 
      context,
      asChild = false, 
      loading = false,
      leftIcon,
      rightIcon,
      gradeLevel,
      children,
      disabled,
      ...props 
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    // Auto-apply grade level variant if specified
    const resolvedVariant = gradeLevel ? (
      gradeLevel === 'k5' ? 'elementary' :
      gradeLevel === '68' ? 'middle' : 'high'
    ) : variant;
    
    // Auto-apply touch size for K-5 students
    const resolvedSize = gradeLevel === 'k5' && size === 'default' ? 'touch' : size;
    
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant: resolvedVariant, 
            size: resolvedSize, 
            context, 
            className 
          })
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div 
            className="animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4"
            aria-hidden="true"
          />
        )}
        
        {/* Left icon */}
        {leftIcon && !loading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Button text */}
        <span className={cn(
          // Hide text when only icons are present
          leftIcon && !children && rightIcon ? 'sr-only' : '',
        )}>
          {children}
        </span>
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };