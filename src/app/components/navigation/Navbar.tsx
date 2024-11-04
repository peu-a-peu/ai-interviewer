import Link from "next/link"

export default function Navbar() {
    return <nav className="px-8 py-4 text-xl">
        <Link href="/" ><b>AI</b> Interviewer</Link>
    </nav>
}