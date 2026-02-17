import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useState } from 'react';

interface TagsInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    error?: string;
    label?: string;
    placeholder?: string;
    className?: string;
}

export function TagsInput({
    value = [],
    onChange,
    error,
    label = 'Tags',
    placeholder = 'Add a tag...',
    className,
}: TagsInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue && !value.includes(trimmedValue)) {
            onChange([...value, trimmedValue]);
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className={cn('space-y-2', className)}>
            <Label>{label}</Label>
            <div className="space-y-3">
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addTag}
                    placeholder={placeholder}
                    className="w-full"
                />
                {value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {value.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="border-red-200 bg-red-50 py-1 pr-1 pl-3 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-2 rounded-full p-0.5 transition-colors hover:bg-red-200 dark:hover:bg-red-900/40"
                                >
                                    <X size={14} />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-gray-500">
                Press Enter or comma to add tags
            </p>
        </div>
    );
}
