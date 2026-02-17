import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { MessageSquare, Star, User as UserIcon, MapPin } from 'lucide-react';

interface Report {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: { name: string };
    destination: { name: string };
}

interface Props {
    reports: Report[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Reviews', href: '/admin/reports/reviews' },
];

export default function Reviews({ reports = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Rating & Review" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Rating & Review</h1>
                    <p className="text-muted-foreground mt-1">
                        Daftar ulasan dan rating terbaru dari pengunjung.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ulasan Terbaru</CardTitle>
                        <CardDescription>Manajemen konten ulasan pengguna</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User / Destinasi</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Komentar</TableHead>
                                    <TableHead className="text-right">Tanggal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 font-semibold">
                                                    <UserIcon className="h-3 w-3 opacity-50" />
                                                    {report.user.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs opacity-70">
                                                    <MapPin className="h-3 w-3" />
                                                    {report.destination.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex text-yellow-500">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star key={s} size={12} fill={s <= report.rating ? "currentColor" : "none"} />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate italic opacity-80">
                                            "{report.comment}"
                                        </TableCell>
                                        <TableCell className="text-right text-xs whitespace-nowrap">
                                            {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reports.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 opacity-50 italic">
                                            Belum ada ulasan yang masuk.
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
