'use client';

import * as React from 'react';
import { createElement } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

/**
 * Card variants for different educational contexts
 */
const cardVariants = cva(
  [
    // Base styles
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    // Accessibility
    'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default: 'border-border',
        elevated: 'border-border shadow-md hover:shadow-lg transition-shadow',
        outlined: 'border-2 border-primary/20',
        // Educational contexts
        lesson: 'border-education-primary-200 bg-education-primary-50/50',
        assessment: 'border-education-secondary-200 bg-education-secondary-50/50',
        progress: 'border-education-tertiary-200 bg-education-tertiary-50/50',
        // Status variants
        success: 'border-success-200 bg-success-50',
        warning: 'border-warning-200 bg-warning-50',
        error: 'border-error-200 bg-error-50',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
        // Grade-appropriate sizes
        k5: 'p-8', // Larger padding for younger students
        middle: 'p-6',
        high: 'p-4', // Compact for older students
      },
      interactive: {
        none: '',
        hover: 'cursor-pointer hover:bg-muted/50 transition-colors',
        clickable: 'cursor-pointer hover:bg-muted/50 hover:scale-[1.02] transition-all duration-200',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      interactive: 'none',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Educational grade level for automatic sizing */
  gradeLevel?: 'k5' | '68' | '912';
  /** Whether the card is currently selected/active */
  selected?: boolean;
}

/**
 * Card Component
 * 
 * Flexible container component for educational content with:
 * - Grade-appropriate sizing and styling
 * - Educational context variants
 * - Interactive states
 * - Accessibility support
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, gradeLevel, selected, ...props }, ref) => {
    // Auto-apply grade level sizing
    const resolvedSize = gradeLevel ? (
      gradeLevel === 'k5' ? 'k5' :
      gradeLevel === '68' ? 'middle' : 'high'
    ) : size;

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size: resolvedSize, interactive }),
          selected && 'ring-2 ring-primary ring-offset-2',
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

/**
 * Card Title Component
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    /** Heading level for semantic HTML */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Grade level for appropriate text sizing */
    gradeLevel?: 'k5' | '68' | '912';
  }
>(({ className, level = 2, gradeLevel, ...props }, ref) => {
  const headingTag = `h${level}`;
  
  const gradeTextClass = gradeLevel ? (
    gradeLevel === 'k5' ? 'text-xl' :
    gradeLevel === '68' ? 'text-lg' : 'text-base'
  ) : 'text-2xl';

  return createElement(
    headingTag,
    {
      ref,
      className: cn(
        gradeTextClass,
        'font-semibold leading-none tracking-tight',
        className
      ),
      ...props
    }
  );
});

CardTitle.displayName = 'CardTitle';

/**
 * Card Description Component
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    /** Grade level for appropriate text sizing */
    gradeLevel?: 'k5' | '68' | '912';
  }
>(({ className, gradeLevel, ...props }, ref) => {
  const gradeTextClass = gradeLevel ? (
    gradeLevel === 'k5' ? 'text-base' :
    gradeLevel === '68' ? 'text-sm' : 'text-sm'
  ) : 'text-sm';

  return (
    <p
      ref={ref}
      className={cn(gradeTextClass, 'text-muted-foreground', className)}
      {...props}
    />
  );
});

CardDescription.displayName = 'CardDescription';

/**
 * Card Content Component
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Whether to add padding (disabled for custom layouts) */
    noPadding?: boolean;
  }
>(({ className, noPadding = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(noPadding ? '' : 'p-6 pt-0', className)}
    {...props}
  />
));

CardContent.displayName = 'CardContent';

/**
 * Card Footer Component
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

/**
 * Educational Activity Card
 * Pre-configured card for learning activities
 */
export interface ActivityCardProps extends Omit<CardProps, 'variant'> {
  title: string;
  description?: string;
  duration?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  completed?: boolean;
  locked?: boolean;
  gradeLevel?: 'k5' | '68' | '912';
  onClick?: () => void;
}

const ActivityCard = React.forwardRef<HTMLDivElement, ActivityCardProps>(
  ({
    title,
    description,
    duration,
    difficulty,
    completed = false,
    locked = false,
    gradeLevel = 'k5',
    onClick,
    className,
    ...props
  }, ref) => {
    const difficultyColors = {
      easy: 'bg-success-100 text-success-800 border-success-200',
      medium: 'bg-warning-100 text-warning-800 border-warning-200', 
      hard: 'bg-error-100 text-error-800 border-error-200',
    };

    return (
      <Card
        ref={ref}
        className={cn(
          'transition-all duration-200',
          onClick && 'cursor-pointer hover:scale-[1.02]',
          locked && 'opacity-60',
          completed && 'bg-success-50 border-success-200',
          className
        )}
        gradeLevel={gradeLevel}
        interactive={onClick ? 'clickable' : 'none'}
        onClick={locked ? undefined : onClick}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle level={3} gradeLevel={gradeLevel}>
              {title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {difficulty && (
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium border',
                  difficultyColors[difficulty]
                )}>
                  {difficulty}
                </span>
              )}
              {completed && (
                <span className="text-success-500" aria-label="Completed">
                  ✓
                </span>
              )}
              {locked && (
                <span className="text-muted-foreground" aria-label="Locked">
                  🔒
                </span>
              )}
            </div>
          </div>
          {description && (
            <CardDescription gradeLevel={gradeLevel}>
              {description}
            </CardDescription>
          )}
        </CardHeader>
        {duration && (
          <CardFooter>
            <span className="text-sm text-muted-foreground">
              ⏱️ {duration}
            </span>
          </CardFooter>
        )}
      </Card>
    );
  }
);

ActivityCard.displayName = 'ActivityCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  ActivityCard,
  cardVariants,
};