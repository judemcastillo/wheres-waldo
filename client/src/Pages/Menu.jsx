import { api, getUser, logout } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";

export default function Menu() {
	const nav = useNavigate();
	const [scenes, setScenes] = useState([]);
	useEffect(() => {
		const ac = new AbortController();
		let alive = true;

		(async () => {
			try {
				const data = await api("/api/scenes", { signal: ac.signal });
				if (alive) setScenes(Array.isArray(data) ? data : []);
			} catch (e) {
				if (e.name !== "AbortError")
					setError(e.message || "Failed to load scenes");
			}
		})();

		return () => {
			alive = false;
			ac.abort();
		};
	}, []);
	const user = getUser();

	function handleLogout() {
		logout();

		nav("/");
	}
	return (
		<>
			<Header />
			<div className="bg-gray-100 min-h-screen min-w-screen flex flex-col items-center font-[verdana]">
				<div className="max-w-[1200px] w-[95vw] flex flex-col gap-4 mt-4 mx-auto ">
					<h3 className="text-xl">
						<span className="font-bold text-2xl">Welcome!! </span>
						{user.name}
					</h3>
					<div className=" font-bold">Scenes</div>
					<img src="/icons/Waldo.png" alt="" />
					{scenes.map((s) => (
						<div key={s.id} className="flex flex-row gap-2 flex-wrap">
							<Link to={`/game/${s.id}`}>
								<div className="rounded-xl w-90 h-65 border-none shadow-2xl flex flex-col">
									<img
										src={s.url}
										alt={s.name || `Scene ${s.id}`}
										className="object-cover w-full h-50 rounded-t-xl"
									/>
									<div className="flex items-center rounded-b px-4 h-full justify-between">
										<div>{(s.name ?? "").trim() || `Scene ${s.id}`}</div>
										<div className="flex gap-1">
											{s.answers?.map((a) => (
												<img
													key={a.character.id}
													src={a.character.iconUrl}
													alt={a.character.name}
													className="size-8"
													loading="lazy"
												/>
											))}
										</div>
									</div>
								</div>
							</Link>
						</div>
					))}
					<button className="bg-red-500" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</div>
		</>
	);
}
