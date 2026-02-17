import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background overflow-hidden relative">
            {/* Left Side: Form */}
            <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-20 relative z-10 bg-white dark:bg-[#0a0a0a]">
                <div className="w-full max-w-md space-y-8">
                    <div className="space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                            <div className="h-10 w-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                                <span className="font-black text-xl">M</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter">Maros<span className="text-red-600">AI</span></span>
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                                {title}
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#161615] rounded-3xl p-2 md:p-0">
                        {children}
                    </div>

                    <p className="text-center text-sm text-muted-foreground pt-8 border-t border-gray-100 dark:border-white/5 italic">
                        &copy; 2025 MarosAI. Jelajahi Keindahan Butta Salewangang.
                    </p>
                </div>
            </div>

            {/* Right Side: Image & Info */}
            <div className="hidden lg:relative lg:flex flex-col justify-end p-12 overflow-hidden bg-[#1b1b18]">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="/images/auth-bg.png"
                        alt="Maros Landscape"
                        className="h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b18] via-transparent to-black/20" />
                </motion.div>

                <div className="relative z-10 space-y-6">
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium"
                    >
                        <MapPin size={16} className="text-red-500" />
                        Rammang-Rammang, Maros
                    </motion.div>

                    <div className="space-y-4 max-w-lg">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-5xl font-black text-white leading-[1.1] tracking-tight"
                        >
                            Keajaiban Karst Terbesar Kedua di Dunia.
                        </motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-xl text-white/80 leading-relaxed font-medium"
                        >
                            Temukan ribuan destinasi menakjubkan di Kabupaten Maros hanya dengan satu genggaman.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex gap-8 pt-6"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-white text-2xl font-black">
                                <Star fill="currentColor" size={24} className="text-yellow-400" />
                                <span>4.9</span>
                            </div>
                            <p className="text-white/60 text-sm font-medium">Ratings</p>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-white text-2xl font-black">
                                <ShieldCheck size={28} className="text-emerald-500" />
                                <span>100%</span>
                            </div>
                            <p className="text-white/60 text-sm font-medium">Verified</p>
                        </div>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-12 right-12 flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-white/20" />
                    <div className="h-3 w-8 rounded-full bg-red-600" />
                </div>
            </div>
        </div>
    );
}
