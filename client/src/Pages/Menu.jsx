import { api, getUser, logout } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import LeaderboardTabs from "../components/LeaderBoardTabs";

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

	return (
		<>
			<Header />
			<div className="bg-gray-100 min-h-screen w-screen flex flex-col items-center font-[verdana] pb-10">
				<div className="max-w-[1200px] w-[95vw] flex flex-col gap-4 mt-4 sm:px-0 justify-center px-4">
					<h3 className="text-xl">
						<span className="font-bold text-2xl">Welcome!! </span>
						{user.name}
					</h3>
					<div className=" font-bold">Scenes</div>
					<img src="/icons/Waldo.png" alt="" />
					<div className="flex justify-center items-center flex-col">
						<div className="flex sm:flex-row gap-5  flex-wrap justify-between items-center w-full flex-col">
							{scenes.map((s) => (
								<Link to={`/game/${s.id}`}>
									<div
										key={s.id}
										className="rounded-xl w-80 h-65 self-center border-none shadow-2xl flex flex-col hover:scale-102 transition-transform duration-75"
									>
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
							))}
						</div>
						
					</div>
					<div className="font-sans  border-t-black border-t-2 w-full pt-3 mt-3 flex flex-col justify-center items-center">
						<span className="font-bold text-center text-xl">Leader Board</span>
						<LeaderboardTabs />
					</div>
				</div>
			</div>
		</>
	);
}
