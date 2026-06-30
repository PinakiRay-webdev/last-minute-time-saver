'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import {toast, ToastContainer} from 'react-toastify';
import api from "../../../lib/api"
import {useRouter} from "next/navigation";


interface ILoginInput {
    email: string;
    password: string;
}

const LoginPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ILoginInput>();

    const router = useRouter();

    const onSubmit = async (data: ILoginInput) => {
        toast.loading("Logging in...", {theme: "dark"});
        await api.post('/api/auth/login', {
            email: data.email,
            password: data.password,
        }).then(() =>{
            toast.dismiss()
            toast.success("Login successful", {theme: "dark"});
            router.push("/dashboard");
        }).catch((error) =>{
            toast.dismiss()
            toast.error(error.message, {theme: 'dark'})
        })
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-sm space-y-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                    <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Email</label>
                            <input
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                                type="email"
                                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Password</label>
                            <input
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                                type="password"
                                className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Sign in
                    </button>
                </form>
            </div>
            <ToastContainer/>
        </div>
    );
};

export default LoginPage;