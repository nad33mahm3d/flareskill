import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero">
      <p className="kicker">404</p>
      <h1>Not found</h1>
      <p className="lede">That skill or profile is not in the registry.</p>
      <Link className="btn btn-primary" href="/">
        Back to skills
      </Link>
    </section>
  );
}
