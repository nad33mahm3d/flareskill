import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p className="lede">That skill or profile is not in the registry.</p>
      <Link href="/">Back to skills</Link>
    </>
  );
}
