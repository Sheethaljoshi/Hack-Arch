import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <div>
      <Navbar />
      <main className="p-4">
        <h1 className="text-2xl font-bold">Welcome to the App</h1>
        <nav className="mt-4 space-x-4">
          <Link href="/HomePage" className="text-blue-500">Home</Link>
          <Link href="/SignUpPage" className="text-blue-500">Sign Up</Link>
          <Link href="/LoginPage" className="text-blue-500">Login</Link>
          <Link href="/ProfilePage" className="text-blue-500">Profile</Link>
        </nav>
      </main>
      <Toaster />
    </div>
  );
}
