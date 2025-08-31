// TargetBox.jsx – percent-based size
export default function TargetBox({ xPct, yPct, sizePct = 0.06 }) {
	// 6% of image width
	return (
		<div
			className="absolute pointer-events-none border-4 border-dashed border-black -translate-x-1/2 -translate-y-1/2 aspect-square"
			style={{
				left: `${xPct * 100}%`,
				top: `${yPct * 100}%`,
				width: `${sizePct * 100}%`,
			}}
			aria-label="target-box"
		/>
	);
}
