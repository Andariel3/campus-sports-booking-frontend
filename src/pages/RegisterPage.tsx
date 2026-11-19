import Register from "@/features/auth/Register";

export function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Register />
      </div>
    </div>
  );
}

export default RegisterPage;
