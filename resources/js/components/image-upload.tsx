import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';

interface ImageUploadProps {
    value?: string | File | null;
    onChange: (file: File | null) => void;
    error?: string;
    label?: string;
    className?: string;
}

export function ImageUpload({ value, onChange, error, label = 'Image', className }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(
        typeof value === 'string' ? value : null
    );
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (file: File | null) => {
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                return;
            }

            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            onChange(file);
        } else {
            setPreview(null);
            onChange(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className={cn('space-y-2', className)}>
            <Label>{label}</Label>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    'relative border-2 border-dashed rounded-xl transition-all',
                    isDragging ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-700',
                    preview ? 'p-0' : 'p-8'
                )}
            >
                {preview ? (
                    <div className="relative group">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover rounded-xl"
                        />
                        <button
                            type="button"
                            onClick={() => handleFileChange(null)}
                            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Drop image here or click to upload
                        </p>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, WebP up to 2MB
                        </p>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                    </label>
                )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
