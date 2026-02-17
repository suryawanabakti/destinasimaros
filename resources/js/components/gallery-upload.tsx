import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { useState } from 'react';

interface GalleryUploadProps {
    value?: File[];
    onChange: (files: File[]) => void;
    error?: string;
    label?: string;
    className?: string;
}

export function GalleryUpload({ value = [], onChange, error, label = 'Gallery Images', className }: GalleryUploadProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFilesChange = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        Array.from(newFiles).forEach(file => {
            if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
                validFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            }
        });

        const updatedFiles = [...value, ...validFiles];
        setPreviews(prev => [...prev, ...newPreviews]);
        onChange(updatedFiles);
    };

    const removeImage = (index: number) => {
        const updatedFiles = value.filter((_, i) => i !== index);
        const updatedPreviews = previews.filter((_, i) => i !== index);

        // Revoke the URL to avoid memory leaks
        URL.revokeObjectURL(previews[index]);

        setPreviews(updatedPreviews);
        onChange(updatedFiles);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesChange(e.dataTransfer.files);
    };

    return (
        <div className={cn('space-y-3', className)}>
            <Label>{label}</Label>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border">
                        <img
                            src={preview}
                            alt={`Gallery ${index}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                <label
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={cn(
                        'aspect-square flex flex-col items-center justify-center cursor-pointer border-2 border-dashed rounded-xl transition-all',
                        isDragging ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-700 hover:border-red-500/50'
                    )}
                >
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-[10px] font-medium text-gray-500 uppercase">Upload</span>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFilesChange(e.target.files)}
                        className="hidden"
                    />
                </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon size={14} />
                <span>Format PNG, JPG, WebP. Maks 2MB per file.</span>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
        </div>
    );
}
