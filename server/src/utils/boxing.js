export function isHit(clickPct, box) {
	const { x, y } = clickPct;
	const dx = Math.abs(box.x - x);
	const dy = Math.abs(box.y - y);
	if (dx < 3 && dy < 3) {
		return true;
	} else {
		return false;
	}
}
