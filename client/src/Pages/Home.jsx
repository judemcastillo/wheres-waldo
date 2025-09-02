import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { api, setToken } from "../lib/api";

export default function Home() {
	const nav = useNavigate();
	const [form, setForm] = useState({ email: "", password: "" });
	const [errMessage, setErrMessage] = useState("");

	async function handleGuestSubmit(e) {
		e.preventDefault();
		try {
			const data = await api("/api/auth/guest", {
				method: "POST",
				body: JSON.stringify({ name: "Guest" }),
			});
			setToken(data.token);
			nav("/menu");
		} catch (err) {
			console.error(err);
		}
	}

	return (
		<div className="bg-gray-200 min-h-screen min-w-screen flex items-start justify-center">
			<div
				className="bg-white w-[95vw] max-w-[900px] p-6 rounded-lg mt-4 shadow-md flex flex-col 
        items-center gap-6"
			>
				<img
					src="/waldo-logo.png"
					alt="Where's Waldo?"
					className="flex  md:w-lg w-3xs sm:w-sm p-2"
				/>
				<div className="flex flex-col gap-2 pt-5 w-2/3 font-sans font-bold">
					<button
						className="rounded bg-green-500 px-10 py-2 text-white cursor-pointer
                    hover:bg-green-400"
						onClick={handleGuestSubmit}
					>
						Play as Guest
					</button>
					<button
						className="rounded bg-blue-500 px-10 py-2 text-white cursor-pointer
                    hover:bg-blue-400"
					>
						Login
					</button>
					<button
						className="rounded bg-gray-500 px-10 py-2 text-white cursor-pointer
                    hover:bg-gray-400"
					>
						Register
					</button>
				</div>

				<div className="font-sans font-bold border-t-black border-t-2 w-full pt-3 mt-3 text-center text-xl">
					Leader Board
				</div>
			</div>
		</div>
	);
}
