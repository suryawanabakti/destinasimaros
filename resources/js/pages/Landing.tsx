import { Head, router } from '@inertiajs/react';
import { logout } from '@/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Sparkles, MapPin, Navigation2, Loader2, Volume2, VolumeX, Mic, MicOff, Star, LogOut, LayoutGrid } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
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
    const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [aiMessage, setAiMessage] = useState('');

    const handleLogout = () => {
        router.post(logout().url);
    };
    const [isPlaying, setIsPlaying] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const [recognitionSupported, setRecognitionSupported] = useState(true);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);

    // Normalize initial destinations
    useEffect(() => {
        const normalizedDestinations = initialDestinations.map(dest => ({
            ...dest,
            tags: Array.isArray(dest.tags) ? dest.tags : []
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

        // Cek Speech Recognition
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
    }, []);

    // Clean up speech synthesis ketika komponen unmount
    useEffect(() => {
        return () => {
            if (utteranceRef.current) {
                speechSynthesis.cancel();
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
            const response = await fetch('/search?query=' + query, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
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
                tags: Array.isArray(dest.tags) ? dest.tags : []
            }));

            setDestinations(normalizedData);
        } catch (error) {
            console.error('Search failed:', error);
            setDestinations(initialDestinations.map(dest => ({
                ...dest,
                tags: Array.isArray(dest.tags) ? dest.tags : []
            })));
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
        if (!speechSupported) return;

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Configure Indonesian voice
        const voices = speechSynthesis.getVoices();
        const indonesianVoice = voices.find(voice =>
            voice.lang.includes('id') || voice.lang.includes('ID') ||
            voice.name.toLowerCase().includes('indonesia')
        );

        if (indonesianVoice) {
            utterance.voice = indonesianVoice;
        } else {
            // Fallback to default voice
            utterance.lang = 'id-ID';
        }

        utterance.rate = 1.0; // Kecepatan bicara
        utterance.pitch = 1.0; // Tinggi nada
        utterance.volume = 1.0; // Volume

        // Event listeners
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            setIsPlaying(false);
        };

        // Start speech
        speechSynthesis.speak(utterance);
    };

    // Safe function to get tags
    const getSafeTags = (tags: any): string[] => {
        if (Array.isArray(tags)) {
            return tags.filter(tag => typeof tag === 'string');
        }
        return [];
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC] font-sans selection:bg-emerald-100 selection:text-emerald-900">
            <Head title="Jelajahi Maros - AI Smart Search" />

            {/* Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-200 rounded-full blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-emerald-500/20">
                        <img src="/logomaros.png" alt="Logo Maros" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Maros<span className="text-emerald-600">AIs</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-80">
                    <a href="#destinations" className="hover:text-emerald-600 transition-colors">Destinasi</a>
                    <a href="#about" className="hover:text-emerald-600 transition-colors">Tentang Maros</a>
                    <a href="#guide" className="hover:text-emerald-600 transition-colors">Panduan</a>
                    {auth.user ? (
                        <div className="flex items-center gap-3">
                            {auth.user.role === 'admin' && (
                                <a
                                    href="/dashboard"
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <LayoutGrid size={16} />
                                    Dashboard
                                </a>
                            )}
                            <a
                                href={auth.user.role === 'admin' ? '/dashboard' : '#'}
                                className="px-4 py-2 bg-emerald-600/10 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                {auth.user.name}
                            </a>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2"
                                title="Keluar"
                            >
                                <LogOut size={20} />
                                <span className="md:hidden">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <a href="/login" className="px-4 py-2 bg-emerald-600/10 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                            Login
                        </a>
                    )}
                </div>
            </nav>

            <main className="relative z-10 px-6 py-12 md:py-24 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold mb-6 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400"
                    >
                        <Sparkles size={14} />
                        Powered by OpenAI
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
                    >
                        Temukan Keajaiban <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Kabupaten Maros</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl opacity-60 max-w-2xl mx-auto leading-relaxed"
                    >
                        Cari destinasi impianmu dengan bahasa alami. "Cari tempat yang sejuk dan banyak air terjun" atau "Gua yang ada lukisan prasejarahnya".
                    </motion.p>
                </div>

                {/* AI Search Bar */}
                <div className="max-w-3xl mx-auto mb-20">
                    <motion.form
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        onSubmit={handleSearch}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                        <div className="relative flex items-center bg-white dark:bg-[#161615] p-2 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 ring-1 ring-black/5">
                            <div className="pl-4 pr-2 text-gray-400">
                                <Search size={24} />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Tuliskan keinginanmu di sini..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-lg py-4 placeholder:text-gray-400 dark:text-white"
                            />
                            <div className="flex items-center gap-2 pr-2">
                                {recognitionSupported && (
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className={cn(
                                            "p-3 rounded-xl transition-all relative overflow-hidden",
                                            isListening
                                                ? "bg-emerald-600 text-white"
                                                : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                        )}
                                        title={isListening ? "Berhenti mendengarkan" : "Gunakan suara"}
                                    >
                                        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                        {isListening && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0.5 }}
                                                animate={{ scale: 2, opacity: 0 }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                className="absolute inset-0 bg-white/30 rounded-full"
                                            />
                                        )}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>Tanyakan AI</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.form>

                    {/* Quick Tags */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {['Air Terjun', 'Kawasan Karst', 'Situs Prasejarah', 'Camping', 'Wisata Keluarga'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => { setQuery(tag); }}
                                className="px-5 py-2 rounded-full bg-white border border-gray-100 text-sm font-medium hover:border-emerald-200 hover:text-emerald-600 transition-all shadow-sm dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
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
                            className="max-w-3xl mx-auto mb-12"
                        >
                            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-lg border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-500" />

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                                        <Sparkles className="text-white w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                                Rekomendasi Wisata Maros
                                            </h3>
                                            {speechSupported && (
                                                <button
                                                    onClick={toggleSpeech}
                                                    disabled={!aiMessage}
                                                    className="p-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title={isPlaying ? "Hentikan suara" : "Dengarkan rekomendasi"}
                                                >
                                                    {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">
                            {isSearching ? 'Rekomendasi Terbaik Untukmu' : 'Destinasi Populer'}
                        </h2>
                        {isSearching && (
                            <button
                                onClick={() => {
                                    setIsSearching(false);
                                    setDestinations(initialDestinations.map(dest => ({
                                        ...dest,
                                        tags: Array.isArray(dest.tags) ? dest.tags : []
                                    })));
                                    setQuery('');
                                    setAiMessage('');
                                    if (isPlaying) {
                                        speechSynthesis.cancel();
                                        setIsPlaying(false);
                                    }
                                }}
                                className="text-emerald-600 font-semibold text-sm hover:underline"
                            >
                                Reset Pencarian
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[450px] rounded-3xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="group relative h-[450px] overflow-hidden rounded-3xl bg-[#161615] cursor-pointer"
                                                onClick={() => router.visit('/destinations/' + dest.id)}
                                            >
                                                <img
                                                    src={dest.image_url}
                                                    alt={dest.name}
                                                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                                                        {dest.category}
                                                    </div>
                                                    {dest.average_rating > 0 && (
                                                        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1 text-yellow-400">
                                                            <Star size={12} fill="currentColor" />
                                                            <span className="text-xs font-bold text-white">{dest.average_rating}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-0 left-0 p-8 w-full group-hover:translate-y-[-10px] transition-transform duration-500">
                                                    <div className="flex items-center gap-2 text-emerald-400 mb-3">
                                                        <MapPin size={16} />
                                                        <span className="text-xs font-semibold uppercase tracking-widest">{dest.location}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{dest.name}</h3>
                                                    <p className="text-sm text-white/70 line-clamp-2 mb-6">
                                                        {dest.description}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {safeTags.slice(0, 3).map(tag => (
                                                            <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/10 border border-white/10 text-white/60">#{tag}</span>
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
                <div id="about" className="mb-24 scroll-mt-24 max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-6">
                                Keindahan Alam <span className="text-emerald-600">Maros</span>
                            </h2>
                            <p className="text-lg leading-relaxed opacity-80 mb-6">
                                Kabupaten Maros adalah surga tersembunyi di Sulawesi Selatan yang menawarkan pesona alam luar biasa.
                            </p>
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl">
                                    <span className="text-2xl font-bold text-emerald-600">45k+</span>
                                    <span className="text-sm opacity-60">Hektar Karst</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-teal-50 dark:bg-teal-900/10 rounded-2xl">
                                    <span className="text-2xl font-bold text-teal-600">250+</span>
                                    <span className="text-sm opacity-60">Gua Alam</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
                                    <span className="text-2xl font-bold text-blue-600">100+</span>
                                    <span className="text-sm opacity-60">Spesies Kupu-kupu</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
                            <img src="https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?q=80&w=1000&auto=format&fit=crop" alt="Rammang-Rammang" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="font-bold text-xl">Rammang-Rammang</p>
                                <p className="text-white/80 text-sm">Salenrang, Bontoa</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guide Section */}
                <div id="guide" className="mb-24 scroll-mt-24 bg-gray-50 dark:bg-white/5 rounded-3xl p-8 md:p-12">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">
                            Panduan <span className="text-emerald-600">Smart Search</span>
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <Search className="w-8 h-8 text-emerald-600" />, title: "Ketik Keinginanmu", desc: "Contoh: 'Tempat healing yang tenang dekat sungai'." },
                            { icon: <Sparkles className="w-8 h-8 text-teal-600" />, title: "AI Menganalisa", desc: "Sistem cerdas mencocokkan keinginan Anda dengan data terbaik." },
                            { icon: <MapPin className="w-8 h-8 text-blue-600" />, title: "Dapatkan Rekomendasi", desc: "Terima daftar tempat wisata paling relevan." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#161615] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-emerald-200 transition-colors">
                                <div className="mb-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl w-fit">{item.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                <p className="opacity-60 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 dark:border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 text-sm italic">
                    <p>&copy; 2025 Wisata Maros. Jelajahi Keindahan Butta Salewangang.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-emerald-600 transition-colors">Instagram</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">TikTok</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}