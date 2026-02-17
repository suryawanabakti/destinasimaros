import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Users, MessageSquare, History, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/admin/reports' },
];

export default function Index() {
    const reportCards = [
        {
            title: 'Laporan Kunjungan',
            description: 'Statistik kunjungan dan popularitas destinasi.',
            icon: Eye,
            href: '/admin/reports/visits',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
        },
        {
            title: 'Laporan Login User',
            description: 'Catatan aktivitas login pengguna terbaru.',
            icon: History,
            href: '/admin/reports/user-logins',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            title: 'Laporan Rating & Review',
            description: 'Ulasan dan rating terbaru dari pengunjung.',
            icon: MessageSquare,
            href: '/admin/reports/reviews',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10'
        },
        {
            title: 'Laporan Data User',
            description: 'Daftar semua pengguna yang terdaftar.',
            icon: Users,
            href: '/admin/reports/users',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Reports" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Laporan Administrasi</h1>
                    <p className="text-muted-foreground mt-1">
                        Pilih laporan yang ingin Anda lihat
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                    {reportCards.map((card, idx) => (
                        <motion.div
                            key={card.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link href={card.href}>
                                <Card className="hover:shadow-lg transition-all group overflow-hidden border-2 hover:border-emerald-500/20">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-4">
                                                <div className={`p-3 rounded-2xl ${card.bgColor}`}>
                                                    <card.icon className={`h-8 w-8 ${card.color}`} />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-xl mb-1">{card.title}</CardTitle>
                                                    <p className="text-muted-foreground text-sm">{card.description}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
