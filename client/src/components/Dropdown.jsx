export default function Dropdown({ xPct, yPct, options, onSelect, onCancel }) {
	const x = xPct < 0.5 ? "+" : "-";
	return (
		<div
			data-waldo-overlay
			className="absolute -translate-x-1/2  flex flex-col  rounded bg-black gap-0.5  border-2"
			style={{
				left: `calc(${xPct * 100}% ${x} 105px)`,
				top: `calc(${yPct * 100}% - 30px)`,
			}}
			onClick={(e) => e.stopPropagation()}
		>
			{options.map((char) => (
				<button
					key={char.name}
					className="bg-white text-black border-none px-5 py-1 hover:bg-slate-200 cursor-pointer rounded flex flex-row gap-2 items-center" 
					onPointerDown={() => onSelect(char)}
				>
					{char.name}
					<img src={char.icon} alt={char.name} className="size-8" />
				</button>
			))}
			<button
				className="bg-red-500 text-slate-100 border border-none px-5 py-1 rounded cursor-pointer hover:bg-red-200 hover:text-black"
				onPointerDown={onCancel}
			>
				Cancel
			</button>
		</div>
	);
}
