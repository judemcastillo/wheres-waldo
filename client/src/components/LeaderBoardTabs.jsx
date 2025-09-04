import { useEffect, useState } from "react";
import { api } from "../lib/api";

function formatMs(ms) {
	const totalSec = Math.floor(ms / 1000);
	const m = Math.floor(totalSec / 60);
	const s = totalSec % 60;
	const cs = Math.floor((ms % 1000) / 10);
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(
		cs
	).padStart(2, "0")}`;
}

export default function LeaderboardTabs() {
	const [scenes, setScenes] = useState([]);
	const [activeSceneId, setActiveSceneId] = useState(null);
	const [scoresByScene, setScoresByScene] = useState({});
	const [loadingScores, setLoadingScores] = useState(false);
	const [scoresError, setScoresError] = useState("");

	async function loadScores(sceneId) {
		if (!sceneId || scoresByScene[sceneId]) return; // simple cache
		try {
			setLoadingScores(true);
			setScoresError("");
			const list = await api(`/api/scores/${sceneId}`);
			setScoresByScene((prev) => ({ ...prev, [sceneId]: list }));
		} catch {
			setScoresError("Failed to load scores.");
		} finally {
			setLoadingScores(false);
		}
	}

	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const data = await api("/api/scenes");
				if (!alive) return;
				setScenes(data);
				const firstId = data?.[0]?.id ?? null;
				setActiveSceneId(firstId);
				if (firstId) loadScores(firstId);
			} catch {
				// ignore; leaderboard is optional
			}
		})();
		return () => {
			alive = false;
		};
	}, []);

	return (
		<div className="mt-2 w-[95%] max-w-[900px] flex flex-col justify-center items-center ">
			<div className="flex flex-row justify-start w-full">
				{scenes.length === 0 && (
					<span className="text-gray-500 text-sm">No scenes yet.</span>
				)}
				{scenes.map((s) => {
					const label = (s.name ?? "").trim() || `Scene ${s.id}`;
					const active = activeSceneId === s.id;
					return (
						<button
							key={s.id}
							onClick={() => {
								setActiveSceneId(s.id);
								loadScores(s.id);
							}}
							className={`px-3 py-1 rounded-t font-semibold ${
								active ? "bg-rose-700 text-white border-b-none border-x border-black border-t" : "bg-rose-300 text-gray-700 "
							}`}
						>
							{label}
						</button>
					);
				})}
			</div>

			<div className="flex justify-center w-full border-t-none">
				<div className="w-full max-w-[900px]">
					{scoresError && (
						<div className="text-red-600 text-sm text-center">
							{scoresError}
						</div>
					)}
					{loadingScores && (
						<div className="text-gray-500 text-sm text-center">Loading…</div>
					)}
					{!loadingScores && activeSceneId && (
						<div className="border-b border-x rounded-b">
							<div className="grid grid-cols-4 font-semibold bg-rose-700 px-3 py-2 text-white">
								<div>Rank</div>
								<div className="col-span-2 text-left">Player</div>
								<div className="text-right">Time (s)</div>
							</div>
							{(scoresByScene[activeSceneId] ?? []).map((row, idx) => (
								<div
									key={row.id}
									className="grid grid-cols-4 px-3 py-2 border-t items-center"
								>
									<div>{idx + 1}</div>
									<div className="col-span-2 text-left truncate">
										{row.player}
									</div>
									<div className="text-right font-mono">{formatMs(row.ms)}</div>
								</div>
							))}
							{(scoresByScene[activeSceneId]?.length ?? 0) === 0 && (
								<div className="px-3 py-6 text-center text-gray-500">
									No scores yet.
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
