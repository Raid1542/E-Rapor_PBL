import LoginForm from "./login/LoginForm";

export const metadata = {
  title: "E-Raport SDIT Ulil Albab",
  description: "Sistem e-raport berbasis web",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
