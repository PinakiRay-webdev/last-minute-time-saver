'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import api from "../../../lib/api"; // Aapka existing axios instance
import { useRouter } from 'next/navigation';

const SignupPage = () => {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        toast.loading("Creating your account...", { theme: "dark" });
        try {
            await api.post('/api/auth/register', data);
            toast.dismiss();
            toast.success("Account created successfully!", { theme: "dark" });
            router.push('/login');
        } catch (error: any) {
            toast.dismiss();
            const errorMessage = error.response?.data?.message || "Registration failed";
            toast.error(errorMessage, { theme: 'dark' });
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Create an account</h2>
                    <p className="mt-2 text-sm text-gray-400">Join and start automating your tasks</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Name</label>
                        <input {...register("name", { required: "Name is required" })} className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white" />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input {...register("email", { required: "Email is required" })} type="email" className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white" />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input {...register("password", { required: "Password is required" })} type="password" className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white" />
                    </div>

                    <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500">
                        Sign up
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already have an account? <a href="/login" className="text-indigo-400 font-semibold">Log in</a>
                </p>
            </div>
            <ToastContainer />
        </div>
    );
};

export default SignupPage;