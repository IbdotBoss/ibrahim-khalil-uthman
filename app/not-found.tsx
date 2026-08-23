import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 28px" }}>
      <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 10px" }}>Record not found</h1>
      <p style={{ fontSize: 15, color: "#5b6b70", margin: "0 0 20px" }}>
        No record matches that address.
      </p>
      <Link href="/" style={{ color: "#006884", fontSize: 14 }}>
        ← back to the list
      </Link>
    </main>
  );
}
