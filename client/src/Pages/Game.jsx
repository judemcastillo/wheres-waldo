import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";

import TargetBox from "../components/TargetBox";
import Dropdown from "../components/Dropdown";
import Timer, { formatMs } from "../components/Timer";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../lib/api";

export default function Game() {
	const { id } = useParams();
	const [scene, setScene] = useState(null);
	const [error, setError] = useState(null);
	const [box, setBox] = useState(null);
	const [result, setResult] = useState(null);
	const [remaining, setRemaining] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const ac = new AbortController();
		let alive = true;

		(async () => {
			try {
				setIsLoading(true);
				setError(null);
				const data = await api(`/api/scenes/${id}`, { signal: ac.signal });
				if (alive) {
					setScene(data);
					setRemaining(data.characters);
					setStartAt(Date.now());
					setRunning(true);
				}
			} catch (e) {
				if (e.name !== "AbortError")
					setError(e.message || "Failed to load scene");
			} finally {
				if (alive) setIsLoading(false);
			}
		})();

		return () => {
			alive = false;
			ac.abort();
		};
	}, [id]);

	// timer state
	const [startAt, setStartAt] = useState(null); // ms timestamp
	const [running, setRunning] = useState(false);
	const [finalMs, setFinalMs] = useState(0);
	const [showWin, setShowWin] = useState(false);

	const imgRef = useRef();
	const wrapRef = useRef();

	useEffect(() => {
		function onDocClick(e) {
			if (!wrapRef.current) return;
			if (!wrapRef.current.contains(e.target)) setBox(null);
		}
		function onKey(e) {
			if (e.key === "Escape") setBox(null);
		}
		document.addEventListener("pointerdown", onDocClick);
		window.addEventListener("keydown", onKey);

		return () => {
			document.removeEventListener("pointerdown", onDocClick);
			window.removeEventListener("keydown", onKey);
		};
	}, []);

	function positionFromEvent(e) {
		const rect = imgRef.current.getBoundingClientRect();
		const xPct = (e.clientX - rect.left) / rect.width;
		const yPct = (e.clientY - rect.top) / rect.height;
		return { xPct: clamp(xPct), yPct: clamp(yPct) };
	}
	const clamp = (n, min = 0.04, max = 0.96) => Math.min(max, Math.max(min, n));

	function onPointerDown(e) {
		if (isLoading) return;
		if (!imgRef.current) return;
		// Ignore taps/clicks that aren’t directly on the image
		if (e.target !== imgRef.current) return;
		setBox(positionFromEvent(e));
		setResult(null);
	}

	async function onSelect(char) {
		const hit = await api("/api/game/check", {
			method: "POST",
			body: JSON.stringify({
				sceneId: id,
				characterId: char.id,
				click: { x: box.xPct, y: box.yPct },
			}),
		});

		if (hit.correct) {
			setResult(
				`You found ${char.name}! At ${(box.xPct * 100).toFixed(1)}%, ${(
					box.yPct * 100
				).toFixed(1)}%`
			);
			toast.success(<img src={char.iconUrl} className="size-7"></img>);
			const left = remaining.filter((n) => n !== char);
			setRemaining(left);
			if (left.length === 0) {
				setRunning(false);
				const ms = Date.now() - startAt; // compute now
				setFinalMs(ms); // update state for UI
				try {
					await sendScore(ms); // send using the fresh value
				} catch (e) {
					console.error("Sending Score failed:", e);
				}
				setShowWin(true);
			}
		} else {
			setResult(
				`Sorry, ${char.name} is not there. At ${(box.xPct * 100).toFixed(
					1
				)}%, ${(box.yPct * 100).toFixed(1)}%`
			);
			toast.error(<img src={char.iconUrl} className="size-7"></img>);
		}

		setBox(null);
	}

	async function sendScore(ms) {
		// id likely comes from useParams() → string
		const payload = { sceneId: Number(id), ms: Math.round(ms) };

		try {
			const res = await api("/api/scores", {
				method: "POST",
				body: JSON.stringify(payload),
			});
			// optional: show leaderboard or toast here
			return res;
		} catch (err) {
			console.error("Sending Score failed:", err);
			setError("Sending Score failed:", err);
		}
	}

	return (
		<>
			<Header />
			<div className="flex flex-col min-h-screen max-w-screen  items-center pb-7">
				<div className="grid grid-cols-3 justify-between items-center  max-w-[1200px] w-[calc(95vw)] mt-8">
					<h2 className="text-xl font-semibold mb-3">
						<div className="flex flex-row gap-4 items-center">
							{isLoading ? (
								<div className="flex items-center gap-2">
									<div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
									<div className="flex gap-2">
										<div className="size-12 bg-slate-200 rounded-full animate-pulse" />
										<div className="size-12 bg-slate-200 rounded-full animate-pulse" />
									</div>
								</div>
							) : remaining.length > 0 ? (
								<h1 className="text-xl">Find:</h1>
							) : (
								"No more characters to find!"
							)}
							{!isLoading &&
								remaining.map((char) => (
									<img
										key={char.name}
										src={char.iconUrl}
										alt={char.name}
										className="size-12"
									/>
								))}
						</div>
					</h2>
					<div className="text-sm text-center">
						Time:{" "}
						<span>
							<Timer startAt={startAt} running={running && !isLoading} />
						</span>
					</div>
					<div className="text-right">{result && <>{result}</>}</div>
				</div>
				<div
					ref={wrapRef}
					className="relative inline-block max-w-screen"
					onPointerDown={onPointerDown}
				>
					{error && (
						<div className="text-red-600 font-semibold mb-2">
							{error}
						</div>
					)}
					{isLoading ? (
						<div className="block w-[calc(95vw)] max-w-[1200px] h-[70vh] bg-slate-200 animate-pulse rounded-lg border-2 border-slate-300" />
					) : (
						<img
							ref={imgRef}
							src={scene?.url}
							alt={scene?.name || "Busy scene"}
							className="block w-[calc(95vw)] border-2 border-slate-700 mx-auto max-w-[1200px]"
						/>
					)}
					{box && (
						<div data-waldo-overlay onClick={(e) => e.stopPropagation()}>
							<TargetBox xPct={box.xPct} yPct={box.yPct} />
						</div>
					)}
					<Toaster
						toastOptions={{
							success: {
								style: {
									background: "green",
								},
							},
							error: {
								style: {
									background: "red",
								},
							},
						}}
						containerStyle={{
							position: "absolute",
							top: 10,
						}}
						position="top-right"
					/>
					{box && (
						<Dropdown
							xPct={box.xPct}
							yPct={box.yPct}
							options={remaining}
							onSelect={onSelect}
							onCancel={() => setBox(null)}
						/>
					)}
					{showWin && (
						<div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center ">
							<div className="bg-slate-200 border border-none rounded-xl p-6 text-center shadow-2xl">
								<h3 className="text-2xl font-semibold mb-2 text-black">
									You found them all! 🎉
								</h3>
								<p className="text-black mb-4">
									Time: <span className="">{formatMs(finalMs)}</span>
								</p>
								<p>{error}</p>
								<Link to="/menu"> 
									<button className="px-4 py-2 bg-rose-600 border-none border-slate-700 hover:bg-slate-700 rounded-xl text-white">
										Back to Menu
									</button>
								</Link>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
