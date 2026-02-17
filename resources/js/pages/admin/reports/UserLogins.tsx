import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { History, User as UserIcon } from 'lucide-react';

interface Report {
    id: number;
    name: string;
    email: string;
    role: string;
    last_login_at: string;
}

interface Props {
    reports: Report[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
    { title: 'User Logins', href: '/admin/reports/user-logins' },
];

export default function UserLogins({ reports = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Login User" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Login User</h1>
                    <p className="text-muted-foreground mt-1">
                        Catatan aktivitas login pengguna terbaru.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Aktivitas Login Terbaru</CardTitle>
                        <CardDescription>Daftar pengguna yang baru saja mengakses sistem</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Pengguna</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Login Terakhir</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                                                    <UserIcon className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <span className="font-semibold">{report.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="opacity-70">{report.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.role === 'admin'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {report.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {new Date(report.last_login_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reports.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-10 opacity-50 italic">
                                            Belum ada data login yang tercatat.
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
