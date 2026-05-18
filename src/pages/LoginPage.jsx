import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const [showForgotPopup, setShowForgotPopup] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    const [showErrorPopup, setShowErrorPopup] = useState(false);
    const [errorPopupMessage, setErrorPopupMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            console.log('Login success, role:', result.role);
            // Redirect berdasarkan role
            if (result.role === 'admin') {
                console.log('Redirecting to /admin-dashboard');
                navigate('/admin-dashboard');
            } else {
                console.log('Redirecting to /dashboard');
                navigate('/dashboard');
            }
        } else {
            setErrorPopupMessage(result.message || 'Email atau password salah');
            setShowErrorPopup(true);
        }

        setIsLoading(false);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        setResetError('');
        setResetSuccess('');

        if (!resetEmail) {
            setResetError('Email harus diisi.');
            return;
        }
        if (!newPassword || !confirmPassword) {
            setResetError('Password baru dan konfirmasi harus diisi.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setResetError('Password baru dan konfirmasi tidak cocok.');
            return;
        }
        if (newPassword.length < 6) {
            setResetError('Password minimal 6 karakter.');
            return;
        }

        setTimeout(() => {
            setResetSuccess('Link reset password akan dikirim ke email Anda.');
            setResetEmail('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setShowForgotPopup(false);
                setResetSuccess('');
            }, 2000);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-sky-950">InsurTech</h2>
                    <p className="mt-2 text-sm text-gray-600">Platform Asuransi Digital</p>
                    <p className="text-xs text-gray-500 mt-1">Silakan masuk ke akun Anda</p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email" name="email" type="email" autoComplete="email" required
                            value={email} onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="contoh@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                        <input
                            id="password" name="password" type="password" autoComplete="current-password" required
                            value={password} onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember" name="remember" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Ingat saya</label>
                        </div>
                        <div className="text-sm">
                            <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotPopup(true); }} className="font-medium text-sky-950 hover:text-sky-700">
                                Lupa Password?
                            </a>
                        </div>
                    </div>

                    <button
                        type="submit" disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-900 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="text-center text-sm">
                    <span className="text-gray-600">Belum punya akun? </span>
                    <Link to="/register" className="font-medium text-sky-900 hover:text-sky-700">Daftar Sekarang</Link>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-500 text-center">
                    <p>Admin: admin@insurtech.com / admin123</p>
                </div>
            </div>

            {/* POPUP LUPA PASSWORD */}
            {showForgotPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative p-6">
                        <button
                            onClick={() => { setShowForgotPopup(false); setResetError(''); setResetSuccess(''); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
                        >×</button>

                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="bg-gray-200 p-3 rounded-xl mb-3">
                                <Shield className="text-sky-900 w-10 h-10" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-sky-950">InsurTech</h2>
                            <p className="mt-1 text-sm text-gray-600">Platform Asuransi Digital</p>
                            <p className="text-xs text-gray-500">Reset Password</p>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                                    className="bg-gray-200 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="nama@gmail.com" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Masukkan Password Baru</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-gray-200 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="......" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-gray-200 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="......" required />
                            </div>
                            {resetError && <div className="bg-red-50 border-l-4 border-red-500 p-2 text-sm text-red-700">{resetError}</div>}
                            {resetSuccess && <div className="bg-green-50 border-l-4 border-green-500 p-2 text-sm text-green-700">{resetSuccess}</div>}
                            <button type="submit" className="w-auto px-6 mt-4 bg-sky-900 hover:bg-gray-400 text-white font-semibold py-2 rounded-md transition mx-auto block">
                                Reset Password
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* POPUP ERROR LOGIN */}
            {showErrorPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative p-6">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Email atau password salah</h3>
                            <p className="text-gray-600 text-sm mt-2">{errorPopupMessage}</p>
                            <button
                                onClick={() => setShowErrorPopup(false)}
                                className="mt-4 px-4 py-2 bg-sky-900 text-white rounded-md hover:bg-gray-400"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}