'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

/**
 * Input variants for educational contexts
 */
const inputVariants = cva(
  [
    // Base styles
    'flex w-full rounded-md border border-input bg-background ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    // Accessibility and focus
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    // Disabled state
    'disabled:cursor-not-allowed disabled:opacity-50',
    // High contrast mode
    'forced-colors:border-[ButtonBorder]',
  ],
  {
    variants: {
      variant: {
        default: 'border-input',
        success: 'border-success-300 focus-visible:ring-success-500',
        warning: 'border-warning-300 focus-visible:ring-warning-500',
        error: 'border-error-300 focus-visible:ring-error-500 bg-error-50/50',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
        // Grade-appropriate sizes
        k5: 'h-12 px-4 py-3 text-base', // Larger for young students
        middle: 'h-10 px-3 py-2 text-sm',
        high: 'h-9 px-3 py-2 text-sm', // Compact for older students
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /** Grade level for automatic sizing */
  gradeLevel?: 'k5' | '68' | '912';
  /** Input state for validation styling */
  state?: 'default' | 'success' | 'warning' | 'error';
  /** Icon to display before input */
  leftIcon?: React.ReactNode;
  /** Icon to display after input */
  rightIcon?: React.ReactNode;
  /** Helper text displayed below input */
  helperText?: string;
  /** Error message displayed below input */
  errorMessage?: string;
  /** Label for the input */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * Educational Input Component
 * 
 * Form input designed for educational platforms with:
 * - WCAG 2.1 AA compliance
 * - Grade-appropriate sizing
 * - Clear validation states
 * - Helpful error messages
 * - Icon support
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      gradeLevel,
      state,
      leftIcon,
      rightIcon,
      helperText,
      errorMessage,
      label,
      required,
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    // Auto-resolve variant based on state
    const resolvedVariant = state && state !== 'default' ? state : variant;
    
    // Auto-apply grade level sizing
    const resolvedSize = gradeLevel ? (
      gradeLevel === 'k5' ? 'k5' :
      gradeLevel === '68' ? 'middle' : 'high'
    ) : size;

    // Generate unique ID if not provided
    const inputId = id || React.useId();
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = state === 'error' || errorMessage;
    const hasHelper = helperText && !hasError;

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              gradeLevel === 'k5' && 'text-base',
              hasError && 'text-error-700'
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-error-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              inputVariants({ variant: resolvedVariant, size: resolvedSize }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={cn(
              hasError && errorId,
              hasHelper && helperTextId
            )}
            aria-required={required}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text */}
        {hasHelper && (
          <p
            id={helperTextId}
            className={cn(
              'text-sm text-muted-foreground',
              gradeLevel === 'k5' && 'text-base'
            )}
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            className={cn(
              'text-sm font-medium text-error-600',
              gradeLevel === 'k5' && 'text-base'
            )}
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea variant of Input
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  Omit<InputProps, 'leftIcon' | 'rightIcon' | 'type'> & 
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    /** Number of visible text lines */
    rows?: number;
    /** Whether the textarea can be resized */
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  }
>(
  (
    {
      className,
      variant,
      size,
      gradeLevel,
      state,
      helperText,
      errorMessage,
      label,
      required,
      id,
      rows = 3,
      resize = 'vertical',
      ...props
    },
    ref
  ) => {
    // Auto-resolve variant based on state
    const resolvedVariant = state && state !== 'default' ? state : variant;
    
    // Auto-apply grade level sizing
    const resolvedSize = gradeLevel ? (
      gradeLevel === 'k5' ? 'k5' :
      gradeLevel === '68' ? 'middle' : 'high'
    ) : size;

    // Generate unique ID if not provided
    const inputId = id || React.useId();
    const helperTextId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;

    const hasError = state === 'error' || errorMessage;
    const hasHelper = helperText && !hasError;

    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              gradeLevel === 'k5' && 'text-base',
              hasError && 'text-error-700'
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-error-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {/* Textarea field */}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            inputVariants({ variant: resolvedVariant, size: resolvedSize }),
            resizeClass,
            'min-h-[80px]',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={cn(
            hasError && errorId,
            hasHelper && helperTextId
          )}
          aria-required={required}
          {...props}
        />

        {/* Helper text */}
        {hasHelper && (
          <p
            id={helperTextId}
            className={cn(
              'text-sm text-muted-foreground',
              gradeLevel === 'k5' && 'text-base'
            )}
          >
            {helperText}
          </p>
        )}

        {/* Error message */}
        {hasError && (
          <p
            id={errorId}
            className={cn(
              'text-sm font-medium text-error-600',
              gradeLevel === 'k5' && 'text-base'
            )}
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea, inputVariants };