import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../services/apiClient';

interface LoginResponse {
    success: boolean;
    message: string;
    token: string;
    admin: {
        id: number;
        username: string;
        name: string;
        email: string;
        role: string;
    };
}

const AdminLogin: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null); // Xóa thông báo lỗi khi người dùng thay đổi input
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await post<LoginResponse>('/admin/login', formData, false);
            
            if (response.success) {
                // Lưu token và thông tin admin
                localStorage.setItem('adminToken', response.token);
                localStorage.setItem('adminData', JSON.stringify(response.admin));
                localStorage.setItem('adminRole', response.admin.role); // Lưu role riêng để dễ truy cập
                
                // Chuyển hướng dựa vào role
                if (response.admin.role === 'super_admin') {
                    navigate('/admin/super-dashboard');
                } else {
                    navigate('/admin/dashboard');
                }
            } else {
                setError(response.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            console.error('Error:', error);
            let errorMessage = 'Đã xảy ra lỗi. Vui lòng thử lại.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng nhập Quản trị viên
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Dành riêng cho quản trị viên hệ thống
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Tên đăng nhập"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mật khẩu</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <a href="/login" className="text-blue-600 hover:text-blue-500">
                        Đăng nhập dành cho người dùng
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin; 