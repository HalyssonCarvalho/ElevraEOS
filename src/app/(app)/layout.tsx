import { DemoRoleProvider } from "@/lib/auth/demo-role-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoRoleProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] w-full mx-auto flex flex-col gap-6">
            {children}
          </main>
        </div>
      </div>
    </DemoRoleProvider>
  );
}
