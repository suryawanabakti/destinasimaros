import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    Edit,
    Image as ImageIcon,
    MapPin,
    Minus,
    Plus,
    Trash2,
} from 'lucide-react';

interface Facility {
    id: number;
    name: string;
    price: string | null;
}

interface Destination {
    id: number;
    name: string;
    description: string;
    location: string;
    image_url: string;
    category: string;
    tags: string[];
    images_count?: number;
    facilities: Facility[];
    created_at: string;
}

interface PaginatedDestinations {
    data: Destination[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    destinations: PaginatedDestinations;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Destinations', href: '/admin/destinations' },
];

export default function Index({ destinations }: Props) {
    const handleDelete = (id: number) => {
        router.delete(`/admin/destinations/${id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Destinations" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Destinations
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage tourist destinations in Maros
                        </p>
                    </div>
                    <Link href="/admin/destinations/create">
                        <Button className="bg-red-600 hover:bg-red-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Destination
                        </Button>
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-20">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Fasilitas</TableHead>
                                <TableHead>Galeri</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {destinations.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="py-12 text-center text-muted-foreground"
                                    >
                                        No destinations found. Create your first
                                        destination!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                destinations.data.map((destination, idx) => (
                                    <motion.tr
                                        key={destination.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell>
                                            <img
                                                src={destination.image_url}
                                                alt={destination.name}
                                                className="h-16 w-16 rounded-lg object-cover"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {destination.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin size={14} />
                                                <span className="text-sm">
                                                    {destination.location}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {destination.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {destination.facilities &&
                                            destination.facilities.length >
                                                0 ? (
                                                <div className="min-w-[180px] space-y-1.5">
                                                    {destination.facilities.map(
                                                        (facility) => (
                                                            <div
                                                                key={
                                                                    facility.id
                                                                }
                                                                className="flex items-start gap-2"
                                                            >
                                                                <Minus
                                                                    size={14}
                                                                    className="mt-0.5 shrink-0 text-red-500"
                                                                />
                                                                <div className="text-sm leading-tight">
                                                                    <span className="font-medium">
                                                                        {
                                                                            facility.name
                                                                        }
                                                                    </span>
                                                                    {facility.price && (
                                                                        <span className="ml-1 text-muted-foreground">
                                                                            ·{' '}
                                                                            {
                                                                                facility.price
                                                                            }
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <ImageIcon
                                                    size={14}
                                                    className="text-red-500"
                                                />
                                                <span className="text-sm font-medium">
                                                    {destination.images_count ||
                                                        0}{' '}
                                                    foto
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/destinations/${destination.id}/edit`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Delete
                                                                Destination
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you
                                                                want to delete "
                                                                {
                                                                    destination.name
                                                                }
                                                                "? This action
                                                                cannot be
                                                                undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        destination.id,
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {destinations.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing {destinations.data.length} of{' '}
                            {destinations.total} destinations
                        </p>
                        <div className="flex gap-2">
                            {Array.from(
                                { length: destinations.last_page },
                                (_, i) => i + 1,
                            ).map((page) => (
                                <Link
                                    key={page}
                                    href={`/admin/destinations?page=${page}`}
                                    preserveScroll
                                >
                                    <Button
                                        variant={
                                            page === destinations.current_page
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                    >
                                        {page}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
