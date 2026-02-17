import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { UserPlus } from 'lucide-react';

export default function Register() {
    return (
        <AuthLayout
            title="Buat Akun Baru"
            description="Bergabunglah dengan komunitas kami untuk mendapatkan rekomendasi terbaik di Maros."
        >
            <Head title="Daftar Akun" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="font-semibold text-gray-700 dark:text-gray-300">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Masukkan nama lengkap Anda"
                                    className="h-12 border-gray-200 dark:border-white/10 rounded-xl focus:ring-red-500"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="nama@email.com"
                                    className="h-12 border-gray-200 dark:border-white/10 rounded-xl focus:ring-red-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300">Kata Sandi</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="h-12 border-gray-200 dark:border-white/10 rounded-xl focus:ring-red-500"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Konfirmasi Sandi
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        className="h-12 border-gray-200 dark:border-white/10 rounded-xl focus:ring-red-500"
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all mt-2 active:scale-[0.98]"
                                tabIndex={5}
                                data-test="register-user-button"
                                disabled={processing}
                            >
                                {processing ? <Spinner className="mr-2" /> : <UserPlus className="mr-2 h-5 w-5" />}
                                Daftarkan Akun
                            </Button>
                        </div>

                        <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                            Sudah memiliki akun?{' '}
                            <TextLink href={login()} className="text-red-600 font-bold hover:underline" tabIndex={6}>
                                Masuk Sekarang
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
