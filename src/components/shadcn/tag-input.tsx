import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from 'lib/utils';
import { Badge } from './badge';

export interface TagInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value: string[];
  onChange: (value: string[]) => void;
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ className, value, onChange, placeholder, ...props }, ref) => {
    const [inputValue, setInputValue] = React.useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const newTag = inputValue.trim();

        if (newTag && !value.includes(newTag)) {
          onChange([...value, newTag]);
        }
        setInputValue('');
      } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    };

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
    };

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        <div
          className={
            'border-input ring-offset-background focus-within:ring-ring flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-primary-foreground/20 ring-offset-background focus:ring-ring -mr-1 flex h-4 w-4 items-center justify-center rounded-full outline-none focus:ring-2"
              >
                <X className="text-primary-foreground hover:text-primary-foreground h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="placeholder:text-muted-foreground min-w-30 flex-1 bg-transparent outline-none"
            placeholder={value.length === 0 ? placeholder : 'Press Enter to add more...'}
            {...props}
          />
        </div>
        <p className="text-muted-foreground text-[0.8rem]">
          Type a value and press{' '}
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
            Enter
          </kbd>{' '}
          or comma to add it.
        </p>
      </div>
    );
  },
);
TagInput.displayName = 'TagInput';
