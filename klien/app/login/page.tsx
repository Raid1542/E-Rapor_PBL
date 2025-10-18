import LoginForm from "./LoginForm";

export const metadata = {
  title: "Login | E-Raport SDIT Ulil Albab",
  description: "Halaman login untuk pengguna e-raport",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <LoginForm />
    </div>
  );
}
