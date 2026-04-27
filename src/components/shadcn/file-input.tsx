import * as React from 'react';
import { Upload, X } from 'lucide-react';

import { Button } from './button';
import { cn } from 'lib/utils';

type FileInputProps = {
  id: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  buttonLabel?: string;
};

export function FileInput({
  id,
  file,
  onFileChange,
  accept,
  className,
  disabled,
  placeholder = 'Choose a file',
  buttonLabel = 'Browse',
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    onFileChange(selectedFile);
    resetInput();
  };

  const handleClear = () => {
    onFileChange(null);
    resetInput();
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-black/15 bg-neutral-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#0c1a4f]">
            {file ? file.name : placeholder}
          </p>
          <p className="text-xs text-neutral-500">
            {file ? 'Selected file will be uploaded after you continue.' : 'No file selected yet.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {file ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              disabled={disabled}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
