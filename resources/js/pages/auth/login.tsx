import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LogIn } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthLayout
            title="Selamat Datang Kembali"
            description="Masuk ke akun Anda untuk mulai menjelajahi keindahan Maros."
        >
            <Head title="Masuk Ke Akun" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-12 border-gray-200 dark:border-white/10 rounded-xl focus:ring-red-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300">Kata Sandi</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-red-600 font-medium hover:text-red-700"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-12 border-gray-200 dark:border-white/10 rounded-xl focus:ring-red-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 py-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <Label htmlFor="remember" className="text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer">Ingat saya untuk sesi berikutnya</Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-12 w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner className="mr-2" /> : <LogIn className="mr-2 h-5 w-5" />}
                                Masuk Sekarang
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mt-2">
                                Belum punya akun?{' '}
                                <TextLink href={register()} className="text-red-600 font-bold hover:underline" tabIndex={5}>
                                    Daftar Gratis
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center text-sm font-bold text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/30">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
