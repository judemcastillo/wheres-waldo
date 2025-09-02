import { Router } from "express";
import { prisma } from "../prisma.js";
import { isHit } from "../utils/boxing.js";

const r = Router();

// /api/game
// Validate a guess
// body: { sceneId, characterId, click: { xPct, yPct } }
r.post("/check", async (req, res) => {
	const { sceneId, characterId, click } = req.body || {};
	if (!sceneId || !characterId || !click)
		return res.status(400).json({ error: "Missing fields" });
	const ans = await prisma.sceneCharacter.findUnique({
		where: {
			sceneId_characterId: {
				sceneId: Number(sceneId),
				characterId: Number(characterId),
			},
		},
		select: { x: true, y: true, w: true, h: true },
	});
	if (!ans) return res.status(404).json({ error: "No such answer" });
	// const correct = isHit({ x: Number(click.xPct), y: Number(click.yPct) }, ans);
	const dx = Math.abs(Number(click.x) - ans.x);
	const dy = Math.abs(Number(click.y) - ans.y);
	const correct = dx < 0.03 && dy < 0.03 ? true : false;
	res.json({ correct });
});

export default r;
