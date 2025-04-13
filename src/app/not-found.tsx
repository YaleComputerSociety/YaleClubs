// src/app/not-found.tsx
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className=" flex flex-col min-h-screen">
      <div className="flex-grow">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-background">
          <Image src="/assets/logo.svg" alt="YaleClubs Logo" width={160} height={160} className="mb-6 animate-bounce" />
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4">404 - Page Not Found</h1>
          <p className="mb-6 text-xl text-gray-600">Oops! The page you are looking for does not exist.</p>
          <Link href="/" className="text-blue-500 hover:underline">
            Go back home
          </Link>
        </div>
        <Footer />
      </div>
    </main>
  );
}
