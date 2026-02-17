import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Eye, MapPin, Star } from 'lucide-react';

interface Report {
    id: number;
    name: string;
    location: string;
    reviews_count: number;
}

interface Props {
    reports: Report[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Visits', href: '/admin/reports/visits' },
];

export default function Visits({ reports = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Kunjungan" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Kunjungan</h1>
                    <p className="text-muted-foreground mt-1">
                        Statistik popularitas destinasi berdasarkan jumlah ulasan.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Peringkat Destinasi</CardTitle>
                        <CardDescription>Destinasi dengan interaksi ulasan terbanyak</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Nama Destinasi</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead className="text-right">Jumlah Ulasan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report, idx) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-medium">{idx + 1}</TableCell>
                                        <TableCell className="font-semibold">{report.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3 opacity-50" />
                                                {report.location}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-bold">
                                                    {report.reviews_count} Ulasan
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reports.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 opacity-50 italic">
                                            Belum ada data kunjungan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
