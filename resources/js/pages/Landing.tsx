import { logout } from '@/routes';
import { Head, router } from '@inertiajs/react';
import { clsx, type ClassValue } from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
    LayoutGrid,
    Loader2,
    LogOut,
    MapPin,
    Mic,
    MicOff,
    Search,
    Sparkles,
    Star,
    Volume2,
    VolumeX,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Destination {
    id: number;
    name: string;
    description: string;
    location: string;
    image_url: string;
    category: string;
    tags: string[];
    average_rating: number;
}

interface Props {
    initialDestinations: Destination[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        } | null;
    };
}

export default function Landing({ initialDestinations, auth }: Props) {
    const [query, setQuery] = useState('');
    const [destinations, setDestinations] =
        useState<Destination[]>(initialDestinations);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [aiMessage, setAiMessage] = useState('');
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const requestLocation = () => {
        if (!('geolocation' in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            () => {
                /* user denied location */
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const handleLogout = () => {
        router.post(logout().url);
    };
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const [recognitionSupported, setRecognitionSupported] = useState(true);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Normalize initial destinations
    useEffect(() => {
        const normalizedDestinations = initialDestinations.map((dest) => ({
            ...dest,
            tags: Array.isArray(dest.tags) ? dest.tags : [],
        }));
        setDestinations(normalizedDestinations);
    }, [initialDestinations]);

    // Cek apakah Speech Synthesis supported
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!('speechSynthesis' in window)) {
            setSpeechSupported(false);
            console.warn('Speech Synthesis tidak didukung di browser ini');
        }

        // Load voices for Speech Synthesis
        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Voices are loaded, we can use them
                console.log(
                    'Voices loaded:',
                    voices.map((v) => v.name),
                );
            }
        };

        // Load voices initially
        loadVoices();

        // Listen for voice changes (voices load asynchronously)
        if ('speechSynthesis' in window) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cek Speech Recognition
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setRecognitionSupported(false);
            console.warn('Speech Recognition tidak didukung di browser ini');
        } else {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'id-ID';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setQuery(transcript);
                // Optional: Auto submit after voice input
                // handleSearch(new Event('submit') as any);
            };
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        // Cleanup
        return () => {
            if ('speechSynthesis' in window) {
                speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    // Request user's location for distance-aware search
    useEffect(() => {
        requestLocation();
    }, []);

    // Clean up speech synthesis dan audio ketika komponen unmount
    useEffect(() => {
        return () => {
            if (utteranceRef.current) {
                speechSynthesis.cancel();
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setIsSearching(true);
        setAiMessage('');

        // Stop speech jika sedang berjalan
        if (isPlaying) {
            speechSynthesis.cancel();
            setIsPlaying(false);
        }

        try {
            const params = new URLSearchParams({ query });
            if (userLocation) {
                params.set('latitude', String(userLocation.latitude));
                params.set('longitude', String(userLocation.longitude));
            }
            const response = await fetch('/search?' + params, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
            });

            const result = await response.json();
            console.log(result);

            const data = result.data || [];
            if (result.message) {
                setAiMessage(result.message);
                // Auto-play speech when message is received
                if (result.message && speechSupported) {
                    // Small delay to ensure state updates and UX flow
                    setTimeout(() => speakMessage(result.message), 500);
                }
            }

            const normalizedData = data.map((dest: any) => ({
                ...dest,
                tags: Array.isArray(dest.tags) ? dest.tags : [],
            }));

            setDestinations(normalizedData);
        } catch (error) {
            console.error('Search failed:', error);
            setDestinations(
                initialDestinations.map((dest) => ({
                    ...dest,
                    tags: Array.isArray(dest.tags) ? dest.tags : [],
                })),
            );
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSpeech = () => {
        if (!speechSupported || !aiMessage) return;

        if (isPlaying) {
            speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            speakMessage(aiMessage);
        }
    };

    const toggleListening = () => {
        if (!recognitionSupported || !recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            // Stop speech synthesis if playing
            if (isPlaying) {
                speechSynthesis.cancel();
                setIsPlaying(false);
            }
            recognitionRef.current.start();
        }
    };

    const speakMessage = (text: string) => {
        speechSynthesis.cancel();

        const loadVoices = () => {
            const voices = speechSynthesis.getVoices();

            console.log('ALL VOICES:', voices);

            // Cari voice Indonesia terbaik
            const indonesianVoice =
                voices.find((v) => v.name.includes('Gadis')) ||
                voices.find((v) => v.name.includes('Ardi')) ||
                voices.find(
                    (v) => v.lang === 'id-ID' && v.name.includes('Microsoft'),
                ) ||
                voices.find((v) => v.lang === 'id-ID');

            console.log('SELECTED VOICE:', indonesianVoice);

            const utterance = new SpeechSynthesisUtterance(text);

            if (indonesianVoice) {
                utterance.voice = indonesianVoice;
            }

            utterance.lang = 'id-ID';

            utterance.rate = 0.92;
            utterance.pitch = 1;
            utterance.volume = 1;

            speechSynthesis.speak(utterance);
        };

        // Tunggu voices ready
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            loadVoices();
        }
    };

    // Safe function to get tags
    const getSafeTags = (tags: any): string[] => {
        if (Array.isArray(tags)) {
            return tags.filter((tag) => typeof tag === 'string');
        }
        return [];
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] font-sans text-[#1b1b18] selection:bg-emerald-100 selection:text-emerald-900 dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <Head title="Jelajahi Maros - AI Smart Search" />

            {/* Gradient Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-30 dark:opacity-20">
                <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-200 blur-[120px]" />
                <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-teal-200 blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-emerald-500/20">
                        <img
                            src="/logomaros.png"
                            alt="Logo Maros"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold tracking-tight">
                        Wisata<span className="text-emerald-600">Maros</span>
                    </span>
                </div>
                <div className="hidden items-center gap-8 text-sm font-medium opacity-80 md:flex">
                    <a
                        href="#destinations"
                        className="transition-colors hover:text-emerald-600"
                    >
                        Destinasi
                    </a>
                    <a
                        href="#about"
                        className="transition-colors hover:text-emerald-600"
                    >
                        Tentang Maros
                    </a>
                    <a
                        href="#guide"
                        className="transition-colors hover:text-emerald-600"
                    >
                        Panduan
                    </a>
                    {auth.user ? (
                        <div className="flex items-center gap-3">
                            {auth.user.role === 'admin' && (
                                <a
                                    href="/dashboard"
                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm transition-all hover:bg-emerald-700"
                                >
                                    <LayoutGrid size={16} />
                                    Dashboard
                                </a>
                            )}
                            <a
                                href={
                                    auth.user.role === 'admin'
                                        ? '/dashboard'
                                        : '#'
                                }
                                className="flex items-center gap-2 rounded-lg bg-emerald-600/10 px-4 py-2 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
                            >
                                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                                {auth.user.name}
                            </a>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg p-2 text-red-600 transition-all hover:bg-red-50"
                                title="Keluar"
                            >
                                <LogOut size={20} />
                                <span className="md:hidden">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <a
                            href="/login"
                            className="rounded-lg bg-emerald-600/10 px-4 py-2 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
                        >
                            Login
                        </a>
                    )}
                </div>
            </nav>

            <main className="relative z-10 mx-auto max-w-7xl px-6 py-12 md:py-24">
                {/* Hero Section */}
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:border-emerald-800/30 dark:bg-emerald-900/20 dark:text-emerald-400"
                    >
                        <Sparkles size={14} />
                        Powered by OpenAI
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6 text-5xl leading-[1.1] font-extrabold tracking-tight md:text-7xl"
                    >
                        Temukan Keajaiban <br />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                            Kabupaten Maros
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mx-auto max-w-2xl text-lg leading-relaxed opacity-60 md:text-xl"
                    >
                        Cari destinasi impianmu dengan bahasa alami. "Cari
                        tempat yang sejuk dan banyak air terjun" atau "Gua yang
                        ada lukisan prasejarahnya".
                    </motion.p>
                </div>

                {/* AI Search Bar */}
                <div className="mx-auto mb-20 max-w-3xl">
                    <motion.form
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleSearch}
                        className="group relative"
                    >
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 blur-xl transition-opacity group-hover:opacity-30" />
                        <div className="relative flex items-center rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl ring-1 ring-black/5 dark:border-white/10 dark:bg-[#161615]">
                            <div className="pr-2 pl-4 text-gray-400">
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Tuliskan keinginanmu di sini..."
                                className="flex-1 border-none bg-transparent py-4 text-lg placeholder:text-gray-400 focus:ring-0 dark:text-white"
                            />
                            <div className="flex items-center gap-2 pr-2">
                                {recognitionSupported && (
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className={cn(
                                            'relative overflow-hidden rounded-xl p-3 transition-all',
                                            isListening
                                                ? 'bg-emerald-600 text-white'
                                                : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20',
                                        )}
                                        title={
                                            isListening
                                                ? 'Berhenti mendengarkan'
                                                : 'Gunakan suara'
                                        }
                                    >
                                        {isListening ? (
                                            <MicOff size={20} />
                                        ) : (
                                            <Mic size={20} />
                                        )}
                                        {isListening && (
                                            <motion.div
                                                initial={{
                                                    scale: 0,
                                                    opacity: 0.5,
                                                }}
                                                animate={{
                                                    scale: 2,
                                                    opacity: 0,
                                                }}
                                                transition={{
                                                    repeat: Infinity,
                                                    duration: 1.5,
                                                }}
                                                className="absolute inset-0 rounded-full bg-white/30"
                                            />
                                        )}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 font-bold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2
                                            className="animate-spin"
                                            size={20}
                                        />
                                    ) : (
                                        <>Tanyakan AI</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.form>

                    {/* Quick Tags */}
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        {[
                            'Air Terjun',
                            'Kawasan Karst',
                            'Situs Prasejarah',
                            'Camping',
                            'Wisata Keluarga',
                        ].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setQuery(tag);
                                }}
                                className="rounded-full border border-gray-100 bg-white px-5 py-2 text-sm font-medium shadow-sm transition-all hover:border-emerald-200 hover:text-emerald-600 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Text & Audio Result */}
                <AnimatePresence>
                    {aiMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mx-auto mb-12 max-w-3xl"
                        >
                            <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/50 p-6 shadow-xl backdrop-blur-lg dark:border-emerald-900/30 dark:bg-white/5">
                                <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 to-teal-500" />

                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                                        <Sparkles className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                                                Rekomendasi Wisata Maros v2
                                            </h3>
                                            {speechSupported && (
                                                <button
                                                    onClick={toggleSpeech}
                                                    disabled={!aiMessage}
                                                    className="rounded-full bg-emerald-50 p-2 text-emerald-600 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                                                    title={
                                                        isPlaying
                                                            ? 'Hentikan suara'
                                                            : 'Dengarkan rekomendasi'
                                                    }
                                                >
                                                    {isPlaying ? (
                                                        <VolumeX size={18} />
                                                    ) : (
                                                        <Volume2 size={18} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                                            "{aiMessage}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                <div id="destinations" className="mb-24 scroll-mt-24">
                    <div className="mb-10 flex items-center justify-between">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {isSearching
                                ? 'Rekomendasi Terbaik Untukmu'
                                : 'Destinasi Populer'}
                        </h2>
                        {isSearching && (
                            <button
                                onClick={() => {
                                    setIsSearching(false);
                                    setDestinations(
                                        initialDestinations.map((dest) => ({
                                            ...dest,
                                            tags: Array.isArray(dest.tags)
                                                ? dest.tags
                                                : [],
                                        })),
                                    );
                                    setQuery('');
                                    setAiMessage('');
                                    if (isPlaying) {
                                        speechSynthesis.cancel();
                                        setIsPlaying(false);
                                    }
                                }}
                                className="text-sm font-semibold text-emerald-600 hover:underline"
                            >
                                Reset Pencarian
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-[450px] animate-pulse rounded-3xl bg-gray-100 dark:bg-white/5"
                                />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                        >
                            <AnimatePresence mode="popLayout">
                                {destinations.length > 0 ? (
                                    destinations.map((dest, idx) => {
                                        const safeTags = getSafeTags(dest.tags);
                                        return (
                                            <motion.div
                                                layout
                                                key={dest.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.9,
                                                }}
                                                transition={{
                                                    delay: idx * 0.1,
                                                }}
                                                className="group relative h-[450px] cursor-pointer overflow-hidden rounded-3xl bg-[#161615]"
                                                onClick={() =>
                                                    router.visit(
                                                        '/destinations/' +
                                                            dest.id,
                                                    )
                                                }
                                            >
                                                <img
                                                    src={dest.image_url}
                                                    alt={dest.name}
                                                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                                    <div className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-md">
                                                        {dest.category}
                                                    </div>
                                                    {dest.average_rating >
                                                        0 && (
                                                        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-yellow-400 backdrop-blur-md">
                                                            <Star
                                                                size={12}
                                                                fill="currentColor"
                                                            />
                                                            <span className="text-xs font-bold text-white">
                                                                {
                                                                    dest.average_rating
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-0 left-0 w-full p-8 transition-transform duration-500 group-hover:translate-y-[-10px]">
                                                    <div className="mb-3 flex items-center gap-2 text-emerald-400">
                                                        <MapPin size={16} />
                                                        <span className="text-xs font-semibold tracking-widest uppercase">
                                                            {dest.location}
                                                        </span>
                                                    </div>
                                                    <h3 className="mb-2 text-2xl leading-tight font-bold text-white">
                                                        {dest.name}
                                                    </h3>
                                                    <p className="mb-6 line-clamp-2 text-sm text-white/70">
                                                        {dest.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {safeTags
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded border border-white/10 bg-white/10 px-2 py-1 text-[10px] text-white/60"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full py-20 text-center opacity-50">
                                        Tidak ada destinasi yang sesuai.
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>

                {/* About Section */}
                <div
                    id="about"
                    className="mx-auto mb-24 max-w-5xl scroll-mt-24"
                >
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <div>
                            <h2 className="mb-6 text-3xl font-bold tracking-tight">
                                Keindahan Alam{' '}
                                <span className="text-emerald-600">Maros</span>
                            </h2>
                            <p className="mb-6 text-lg leading-relaxed opacity-80">
                                Kabupaten Maros adalah surga tersembunyi di
                                Sulawesi Selatan yang menawarkan pesona alam
                                luar biasa.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/10">
                                    <span className="text-2xl font-bold text-emerald-600">
                                        45k+
                                    </span>
                                    <span className="text-sm opacity-60">
                                        Hektar Karst
                                    </span>
                                </div>
                                <div className="flex flex-col items-center rounded-2xl bg-teal-50 p-4 dark:bg-teal-900/10">
                                    <span className="text-2xl font-bold text-teal-600">
                                        250+
                                    </span>
                                    <span className="text-sm opacity-60">
                                        Gua Alam
                                    </span>
                                </div>
                                <div className="flex flex-col items-center rounded-2xl bg-blue-50 p-4 dark:bg-blue-900/10">
                                    <span className="text-2xl font-bold text-blue-600">
                                        100+
                                    </span>
                                    <span className="text-sm opacity-60">
                                        Spesies Kupu-kupu
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="group relative h-[400px] overflow-hidden rounded-3xl shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=1000&auto=format&fit=crop"
                                alt="Rammang-Rammang"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="text-xl font-bold">
                                    Rammang-Rammang
                                </p>
                                <p className="text-sm text-white/80">
                                    Salenrang, Bontoa
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guide Section */}
                <div
                    id="guide"
                    className="mb-24 scroll-mt-24 rounded-3xl bg-gray-50 p-8 md:p-12 dark:bg-white/5"
                >
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight">
                            Panduan{' '}
                            <span className="text-emerald-600">
                                Smart Search
                            </span>
                        </h2>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: (
                                    <Search className="h-8 w-8 text-emerald-600" />
                                ),
                                title: 'Ketik Keinginanmu',
                                desc: "Contoh: 'Tempat healing yang tenang dekat sungai'.",
                            },
                            {
                                icon: (
                                    <Sparkles className="h-8 w-8 text-teal-600" />
                                ),
                                title: 'AI Menganalisa',
                                desc: 'Sistem cerdas mencocokkan keinginan Anda dengan data terbaik.',
                            },
                            {
                                icon: (
                                    <MapPin className="h-8 w-8 text-blue-600" />
                                ),
                                title: 'Dapatkan Rekomendasi',
                                desc: 'Terima daftar tempat wisata paling relevan.',
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors hover:border-emerald-200 dark:border-white/5 dark:bg-[#161615]"
                            >
                                <div className="mb-4 w-fit rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                                    {item.icon}
                                </div>
                                <h3 className="mb-2 text-xl font-bold">
                                    {item.title}
                                </h3>
                                <p className="leading-relaxed opacity-60">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 px-6 py-12 dark:border-white/5">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-sm italic opacity-60 md:flex-row">
                    <p>
                        &copy; 2025 Wisata Maros. Jelajahi Keindahan Butta
                        Salewangang.
                    </p>
                    <div className="flex gap-8">
                        <a
                            href="#"
                            className="transition-colors hover:text-emerald-600"
                        >
                            Instagram
                        </a>
                        <a
                            href="#"
                            className="transition-colors hover:text-emerald-600"
                        >
                            Twitter
                        </a>
                        <a
                            href="#"
                            className="transition-colors hover:text-emerald-600"
                        >
                            TikTok
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
