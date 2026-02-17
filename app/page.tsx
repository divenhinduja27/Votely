import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">
        Votely
      </h1>

      <p className="text-gray-600 mb-8">
        Create and share real-time polls instantly
      </p>

      <Link
        href="/create"
        className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
      >
        Create a Poll
      </Link>
    </main>
  );
}
