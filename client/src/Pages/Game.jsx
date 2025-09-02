import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";

import TargetBox from "../components/TargetBox";
import Dropdown from "../components/Dropdown";
import Timer, { formatMs } from "../components/Timer";
import toast, { Toaster } from "react-hot-toast";
import { api } from "../lib/api";

export default function Game() {
	const { id } = useParams();
	const [scene, setScene] = useState([]);
	const [error, setError] = useState(null);
	const [box, setBox] = useState(null);
	const [result, setResult] = useState(null);
	const [remaining, setRemaining] = useState([]);

	useEffect(() => {
		const ac = new AbortController();
		let alive = true;

		(async () => {
			try {
				const data = await api(`/api/scenes/${id}`, { signal: ac.signal });
				if (alive) {
					setScene(data);
					setRemaining(data.characters);
				}
			} catch (e) {
				if (e.name !== "AbortError")
					setError(e.message || "Failed to load scene");
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
		setStartAt(Date.now());
		setRunning(true);

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
	const clamp = (n, min = 0.02, max = 0.98) => Math.min(max, Math.max(min, n));

	function onPointerDown(e) {
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
				setFinalMs(Date.now() - startAt);
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

	return (
		<>
			<Header />
			<div className="flex flex-col min-h-screen max-w-screen justify-center items-center">
				<div className="flex flex-row justify-between items-center  max-w-[1200px] w-[calc(95vw)]">
					<h2 className="text-xl font-semibold mb-3">
						<div className="flex flex-row gap-4 items-center">
							{remaining ? (
								<h1 className="text-xl">Find :</h1>
							) : (
								"No more characters to find!"
							)}
							{remaining.map((char) => (
								<img
									key={char.name}
									src={char.iconUrl}
									alt={char.name}
									className="size-12"
								/>
							))}
						</div>
					</h2>
					<div className="text-sm">
						Time:{" "}
						<span className="font-mono">
							<Timer startAt={startAt} running={running} />
						</span>
					</div>
					<div className="">{result && <>{result}</>}</div>
				</div>
				<div
					ref={wrapRef}
					className="relative inline-block max-w-screen"
					onPointerDown={onPointerDown}
				>
					<img
						ref={imgRef}
						src={scene.url}
						alt="Busy scene"
						className="block w-[calc(95vw)] border-2 border-slate-700 mx-auto max-w-[1200px]"
					/>
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
						<div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
							<div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-center">
								<h3 className="text-2xl font-semibold mb-2 text-amber-50">
									You found them all! 🎉
								</h3>
								<p className="text-slate-300 mb-4">
									Time: <span className="font-mono">{formatMs(finalMs)}</span>
								</p>
								<button className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700">
									Play again
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
