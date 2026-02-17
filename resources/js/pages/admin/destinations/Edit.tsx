import { GalleryUpload } from '@/components/gallery-upload';
import { ImageUpload } from '@/components/image-upload';
import InputError from '@/components/input-error';
import { TagsInput } from '@/components/tags-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { FormEventHandler } from 'react';

interface DestinationImage {
    id: number;
    image_url: string;
}

interface Destination {
    id: number;
    name: string;
    description: string;
    location: string;
    image_url: string;
    category: string;
    tags: string[];
    images: DestinationImage[];
}

interface Props {
    destination: Destination;
}

const categories = [
    'Wisata Alam',
    'Wisata Budaya',
    'Wisata Sejarah',
    'Wisata Kuliner',
    'Wisata Religi',
    'Wisata Petualangan',
];

export default function Edit({ destination }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Destinations', href: '/admin/destinations' },
        {
            title: destination.name,
            href: `/admin/destinations/${destination.id}/edit`,
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: destination.name,
        description: destination.description,
        location: destination.location || '',
        category: destination.category || '',
        tags: destination.tags || [],
        image: null as File | null,
        gallery: [] as File[],
        _method: 'PUT',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(`/admin/destinations/${destination.id}`);
    };

    const deleteGalleryImage = (imageId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus gambar ini dari galeri?')) {
            router.delete(`/admin/destination-images/${imageId}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${destination.name}`} />

            <div className="mx-auto flex h-full max-w-4xl flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/destinations">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Destination
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Update destination information
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-xl border bg-card p-8"
                >
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Bantimurung Waterfall"
                            className="w-full"
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            placeholder="Describe the destination..."
                            rows={5}
                            className="w-full resize-none"
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Location & Category */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={data.location}
                                onChange={(e) =>
                                    setData('location', e.target.value)
                                }
                                placeholder="e.g., Bantimurung, Maros"
                                className="w-full"
                            />
                            <InputError message={errors.location} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={data.category}
                                onValueChange={(value) =>
                                    setData('category', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category} />
                        </div>
                    </div>

                    {/* Tags */}
                    <TagsInput
                        value={data.tags}
                        onChange={(tags) => setData('tags', tags)}
                        error={errors.tags}
                        placeholder="Add tags like 'air terjun', 'keluarga', etc."
                    />

                    {/* Image Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUpload
                            value={data.image || destination.image_url}
                            onChange={(file) => setData('image', file)}
                            error={errors.image}
                            label="Thumbnail (Cover)"
                        />

                        <div className="space-y-4">
                            <Label>Galeri Foto Baru</Label>
                            <GalleryUpload
                                value={data.gallery}
                                onChange={(files) => setData('gallery', files)}
                                error={errors.gallery as unknown as string}
                                label=""
                            />
                        </div>
                    </div>

                    {/* Existing Gallery Management */}
                    {destination.images && destination.images.length > 0 && (
                        <div className="space-y-3 pt-4">
                            <Label>Kelola Galeri yang Ada</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {destination.images.map((img) => (
                                    <div key={img.id} className="relative aspect-square group rounded-xl overflow-hidden border">
                                        <img
                                            src={img.image_url}
                                            alt="Gallery"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => deleteGalleryImage(img.id)}
                                            className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4 border-t pt-6">
                        <Link href="/admin/destinations">
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Update Destination'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
