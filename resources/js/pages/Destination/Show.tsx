
import { Head, Link } from '@inertiajs/react';
import { MapPin, ArrowLeft, Ticket, Clock, Info, Navigation2, Star, Send, User, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface User {
    id: number;
    name: string;
}

interface Review {
    id: number;
    user_id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: User;
}

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
    reviews: Review[];
    images: DestinationImage[];
    average_rating: number;
}

interface Props {
    destination: Destination;
    auth: {
        user: User | null;
    };
}

export default function Show({ destination, auth }: Props) {
    // Ensure tags is array
    const tags = Array.isArray(destination.tags) ? destination.tags : [];
    const [hoveredRating, setHoveredRating] = useState(0);
    const [activeImage, setActiveImage] = useState(destination.image_url);

    const { data, setData, post, processing, reset, errors } = useForm({
        destination_id: destination.id,
        rating: 5,
        comment: '',
    });

    const submitReview = (e: React.FormEvent) => {
        e.preventDefault();
        post('/reviews', {
            onSuccess: () => {
                reset('comment', 'rating');
                setHoveredRating(0);
            },
        });
    };

    const allImages = [destination.image_url, ...(destination.images?.map(img => img.image_url) || [])];

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] font-sans selection:bg-red-100 selection:text-red-900">
            <Head title={`${destination.name} - Jelajahi Maros`} />

            {/* Navigation (Simplified) */}
            <nav className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 lg:px-12">
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white hover:bg-white/30 transition-all group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Kembali</span>
                </Link>

                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">Maros<span className="text-red-500">AI</span></span>
                </div>
            </nav>

            {/* Hero Image */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        src={activeImage}
                        alt={destination.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b18] via-transparent to-black/30 md:from-[#0a0a0a]" />

                <div className="absolute bottom-0 left-0 w-full p-6 lg:p-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-wrap items-center gap-3 mb-4"
                        >
                            <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold uppercase tracking-wider">
                                {destination.category}
                            </span>
                            {tags.map((tag, index) => (
                                <span key={index} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </motion.div>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight"
                        >
                            {destination.name}
                        </motion.h1>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-4 text-white/90"
                        >
                            <div className="flex items-center gap-1.5">
                                <MapPin size={20} className="text-red-500" />
                                <span className="font-medium">{destination.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                                <span className="font-bold">{destination.average_rating}</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <br />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 -mt-20 relative z-10">
                {/* Gallery Thumbnails - Moved inside to avoid overlap issues */}
                {allImages.length > 1 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-10 overflow-x-auto no-scrollbar pb-2"
                    >
                        <div className="flex gap-4">
                            {allImages.map((img, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveImage(img)}
                                    className={cn(
                                        "relative flex-shrink-0 w-24 h-16 md:w-40 md:h-24 rounded-2xl overflow-hidden border-2 transition-all shadow-lg",
                                        activeImage === img ? "border-red-500 ring-4 ring-red-500/20" : "border-white/20 opacity-80 hover:opacity-100 hover:border-white/40"
                                    )}
                                >
                                    <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="bg-white dark:bg-[#161615] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-white/5">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Info className="text-red-500" />
                                Tentang Destinasi
                            </h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                {destination.description}
                            </div>
                        </div>

                        {/* Dedicated Gallery Grid */}
                        <div className="bg-white dark:bg-[#161615] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-white/5">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <ImageIcon className="text-red-500" />
                                Galeri Foto
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {allImages.map((img, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => setActiveImage(img)}
                                        className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group border border-gray-100 dark:border-white/5"
                                    >
                                        <img
                                            src={img}
                                            alt={`${destination.name} gallery ${index}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                <ImageIcon size={20} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, idx) => (
                                    <span key={idx} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-sm font-medium border border-transparent hover:border-red-200 transition-colors">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div id="reviews" className="bg-white dark:bg-[#161615] rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-white/5 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <MessageCircle className="text-red-500" />
                                    Ulasan Pengunjung
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={16} fill={s <= Math.round(destination.average_rating) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="font-bold text-lg">{destination.average_rating}</span>
                                </div>
                            </div>

                            {/* Review Form */}
                            {auth.user ? (
                                <form onSubmit={submitReview} className="space-y-4 p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold opacity-70">Bagaimana pengalamanmu?</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setData('rating', star)}
                                                    onMouseEnter={() => setHoveredRating(star)}
                                                    onMouseLeave={() => setHoveredRating(0)}
                                                    className="transition-transform hover:scale-110 active:scale-90"
                                                >
                                                    <Star
                                                        size={28}
                                                        className={cn(
                                                            "transition-colors",
                                                            (hoveredRating || data.rating) >= star
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-gray-300 dark:text-gray-600"
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold opacity-70">Tuliskan komentar</label>
                                        <textarea
                                            value={data.comment}
                                            onChange={e => setData('comment', e.target.value)}
                                            placeholder="Berikan ulasan Anda mengenai tempat ini..."
                                            className="w-full h-32 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-red-500 transition-all resize-none"
                                        />
                                        {errors.comment && <div className="text-red-500 text-xs">{errors.comment}</div>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                                    >
                                        {processing ? 'Mengirim...' : 'Kirim Ulasan'}
                                        <Send size={18} />
                                    </button>
                                </form>
                            ) : (
                                <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-center">
                                    <p className="opacity-70 mb-4">Silakan login untuk memberikan ulasan.</p>
                                    <a href="/login" className="text-red-600 font-bold hover:underline">Login Sekarang</a>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {destination.reviews.length > 0 ? (
                                    destination.reviews.map((review, idx) => (
                                        <motion.div
                                            key={review.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group flex gap-4 p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-50 dark:border-white/5 hover:border-red-100 dark:hover:border-red-900/20 transition-all"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                                <User className="text-red-600 w-6 h-6" />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold">{review.user.name}</h4>
                                                        <p className="text-xs opacity-50">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="flex text-yellow-400">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star key={s} size={14} fill={s <= review.rating ? "currentColor" : "none"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 opacity-50 italic">
                                        Belum ada ulasan untuk destinasi ini.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar Information */}
                    <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-800/20">
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4">Informasi Kunjungan</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold opacity-80">Jam Operasional</p>
                                        <p className="font-medium">08:00 - 17:00 WITA</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Ticket className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold opacity-80">Tiket Masuk (Estimasi)</p>
                                        <p className="font-medium">Rp 15.000 - Rp 50.000</p>
                                    </div>
                                </div>
                            </div>

                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ' ' + destination.location)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-8 block w-full py-3 bg-red-600 text-white text-center rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                            >
                                Lihat di Google Maps
                            </a>
                        </div>

                        <div className="bg-white dark:bg-[#161615] p-6 rounded-3xl border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold mb-2">Tips Berkunjung</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm opacity-70 leading-relaxed">
                                <li>Bawa bekal air minum secukupnya.</li>
                                <li>Gunakan alas kaki yang nyaman untuk berjalan.</li>
                                <li>Jaga kebersihan area wisata.</li>
                                <li>Siapkan kamera untuk momen terbaik!</li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-white/5 py-12 px-6 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-sm italic">
                    <p>&copy; 2025 Wisata Maros. Jelajahi Keindahan Butta Salewangang.</p>
                </div>
            </footer>
        </div>
    );
}
