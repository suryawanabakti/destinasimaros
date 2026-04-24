import { GalleryUpload } from '@/components/gallery-upload';
import { ImageUpload } from '@/components/image-upload';
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
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Destinations', href: '/admin/destinations' },
    { title: 'Create', href: '/admin/destinations/create' },
];

const categories = [
    'Wisata Alam',
    'Wisata Budaya',
    'Wisata Sejarah',
    'Wisata Kuliner',
    'Wisata Religi',
    'Wisata Petualangan',
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        location: '',
        category: '',
        tags: [] as string[],
        operational_hours: '',
        entrance_fee: '',
        google_maps_url: '',
        visiting_tips: [] as string[],
        image: null as File | null,
        gallery: [] as File[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/destinations');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Destination" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/destinations">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Destination</h1>
                        <p className="text-muted-foreground mt-1">
                            Add a new tourist destination to Maros
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6 bg-card rounded-xl border p-8">
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
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe the destination..."
                            rows={5}
                            className="w-full resize-none"
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Location & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                placeholder="e.g., Bantimurung, Maros"
                                className="w-full"
                            />
                            <InputError message={errors.location} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={data.category}
                                onValueChange={(value) => setData('category', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.category} />
                        </div>
                    </div>

                    <TagsInput
                        value={data.tags}
                        onChange={(tags) => setData('tags', tags)}
                        error={errors.tags}
                        label="Tags"
                        placeholder="Add tags like 'air terjun', 'keluarga', etc."
                    />

                    {/* Visiting Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="operational_hours">Jam Operasional</Label>
                            <Input
                                id="operational_hours"
                                value={data.operational_hours}
                                onChange={(e) => setData('operational_hours', e.target.value)}
                                placeholder="e.g., 08:00 - 17:00 WITA"
                                className="w-full"
                            />
                            <InputError message={errors.operational_hours} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="entrance_fee">Tiket Masuk (Estimasi)</Label>
                            <Input
                                id="entrance_fee"
                                value={data.entrance_fee}
                                onChange={(e) => setData('entrance_fee', e.target.value)}
                                placeholder="e.g., Rp 15.000 - Rp 50.000"
                                className="w-full"
                            />
                            <InputError message={errors.entrance_fee} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="google_maps_url">Google Maps URL</Label>
                        <Input
                            id="google_maps_url"
                            value={data.google_maps_url}
                            onChange={(e) => setData('google_maps_url', e.target.value)}
                            placeholder="https://goo.gl/maps/..."
                            className="w-full"
                        />
                        <InputError message={errors.google_maps_url} />
                    </div>

                    <TagsInput
                        value={data.visiting_tips}
                        onChange={(tips) => setData('visiting_tips', tips)}
                        error={errors.visiting_tips as unknown as string}
                        label="Tips Berkunjung"
                        placeholder="Tambah tips... (tekan Enter)"
                    />

                    {/* Image Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUpload
                            value={data.image}
                            onChange={(file) => setData('image', file)}
                            error={errors.image}
                            label="Thumbnail (Cover)"
                        />

                        <div className="space-y-2">
                            <GalleryUpload
                                value={data.gallery}
                                onChange={(files) => setData('gallery', files)}
                                error={errors.gallery as unknown as string}
                                label="Galeri Foto Tambahan"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
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
                            {processing ? 'Saving...' : 'Create Destination'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
