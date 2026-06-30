import Sidebar from "@/src/component/layout/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex bg-gray-950 min-h-screen">
            <Sidebar />
            <main className="flex-1 p-3 ml-64">
                {children}
            </main>
        </div>
    );
}