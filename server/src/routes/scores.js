import { Router } from "express";
import passport from "../auth.js";
import { prisma } from "../prisma.js";

const r = Router();
// /api/scores
r.get("/:sceneId", async (req, res) => {
	const sceneId = Number(req.params.sceneId);
	const list = await prisma.score.findMany({
		where: { sceneId },
		orderBy: { ms: "asc" },
		take: 20,
		select: {
			id: true,
			ms: true,
			createdAt: true,
			user: { select: { name: true } },
			guest: { select: { name: true } },
		},
	});
	const mapped = list.map((s) => ({
		id: s.id,
		ms: s.ms,
		player: s.user?.name || s.guest?.name || "Anonymous",
		createdAt: s.createdAt,
	}));
	res.json(mapped);
});

// Submit a score (auth: user or guest)
r.post(
	"/",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const { sceneId, ms } = req.body || {};
		if (!sceneId || !ms)
			return res.status(400).json({ error: "sceneId and ms required" });

		let data = { sceneId: Number(sceneId), ms: Number(ms) };
		if (req.user.role === "USER") data.userId = req.user.id;
		if (req.user.role === "GUEST") data.guestId = req.user.id;

		const score = await prisma.score.create({ data });
		res.json(score);
	}
);

export default r;
