import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { MapPin, Plus, TrendingUp, Users, MessageSquare, History as HistoryIcon, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface Destination {
    id: number;
    name: string;
    location: string;
    image_url: string;
}

interface Props {
    totalDestinations?: number;
    totalUsers?: number;
    totalReviews?: number;
    averageRating?: number;
    recentDestinations?: Destination[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    totalDestinations = 0,
    totalUsers = 0,
    totalReviews = 0,
    averageRating = 0,
    recentDestinations = []
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome to Maros Tourism Admin Panel
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Destinasi</CardTitle>
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalDestinations}</div>
                                <p className="text-xs text-muted-foreground mt-1">Destinasi wisata terdaftar</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalUsers}</div>
                                <p className="text-xs text-muted-foreground mt-1">Pengguna terdaftar</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Ulasan</CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalReviews}</div>
                                <p className="text-xs text-muted-foreground mt-1">Komentar & Rating</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Rata-rata Rating</CardTitle>
                                <Plus className="h-4 w-4 text-muted-foreground rotate-45" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{averageRating} / 5.0</div>
                                <p className="text-xs text-muted-foreground mt-1">Kepuasan pengunjung</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Quick Actions & Navigation to Reports */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Laporan Ringkas</CardTitle>
                            <CardDescription>Akses cepat ke menu laporan administrasi</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <Link href="/admin/reports/visits">
                                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                                    <Eye className="h-4 w-4 text-emerald-500" />
                                    Laporan Kunjungan
                                </Button>
                            </Link>
                            <Link href="/admin/reports/user-logins">
                                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                                    <HistoryIcon className="h-4 w-4 text-blue-500" />
                                    Laporan Login User
                                </Button>
                            </Link>
                            <Link href="/admin/reports/reviews">
                                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                                    <MessageSquare className="h-4 w-4 text-yellow-500" />
                                    Laporan Rating & Review
                                </Button>
                            </Link>
                            <Link href="/admin/reports/users">
                                <Button variant="outline" className="w-full justify-start gap-2 h-12">
                                    <Users className="h-4 w-4 text-purple-500" />
                                    Laporan Data User
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Cepat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/admin/destinations/create" className="block">
                                <Button className="w-full bg-red-600 hover:bg-red-700">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Destinasi
                                </Button>
                            </Link>
                            <Link href="/admin/destinations" className="block">
                                <Button variant="outline" className="w-full">
                                    Kelola Destinasi
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Destinations */}
                {recentDestinations.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Destinations</CardTitle>
                                <CardDescription>
                                    Latest destinations added to the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {recentDestinations.map((destination, idx) => (
                                        <motion.div
                                            key={destination.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + idx * 0.1 }}
                                            className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md transition-shadow"
                                        >
                                            <img
                                                src={destination.image_url}
                                                alt={destination.name}
                                                className="w-full h-32 object-cover"
                                            />
                                            <div className="p-4">
                                                <h3 className="font-semibold">{destination.name}</h3>
                                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin size={14} />
                                                    {destination.location}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </AppLayout>
    );
}

