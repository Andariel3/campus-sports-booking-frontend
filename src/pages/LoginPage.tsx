import Login from "@/features/auth/Login";

export function LoginPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-50/40 to-slate-100/60 flex flex-col justify-center py-6 px-4 overflow-hidden">
      {/* Element decorativ ambiental inovativ */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#0F52BA]/10 to-indigo-500/5 rounded-full blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 right-10 w-[400px] h-[400px] bg-gradient-to-tl from-emerald-500/5 to-[#0F52BA]/10 rounded-full blur-3xl opacity-60" />
      
      <div className="relative z-10">
        <Login />
      </div>
    </div>
  );
}

export default LoginPage;
