import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, Mail, Shield } from 'lucide-react';

interface Report {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface Props {
    reports: Report[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
    { title: 'Users', href: '/admin/reports/users' },
];

export default function UsersReport({ reports = [] }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Data User" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Data User</h1>
                    <p className="text-muted-foreground mt-1">
                        Daftar lengkap pengguna terdaftar dalam sistem.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Master Data User</CardTitle>
                        <CardDescription>Seluruh pengguna yang memiliki akses ke sistem</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Pengguna</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Tanggal Bergabung</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell className="font-semibold">{report.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 opacity-70 italic text-xs">
                                                <Mail className="h-3 w-3" />
                                                {report.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Shield size={12} className={report.role === 'admin' ? 'text-red-500' : 'text-gray-400'} />
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${report.role === 'admin'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    {report.role}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs opacity-70">
                                            {new Date(report.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
