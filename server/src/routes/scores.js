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
		try {
			const sid = Number(req.body?.sceneId);
			const ms = Math.round(Number(req.body?.ms));

			if (!Number.isFinite(sid) || !Number.isFinite(ms) || ms <= 0) {
				console.warn("Bad payload for /scores", req.body);
				return res
					.status(400)
					.json({
						error: "sceneId and ms (milliseconds) are required numbers",
					});
			}

			// optional: ensure scene exists
			const scene = await prisma.scene.findUnique({
				where: { id: sid },
				select: { id: true },
			});
			if (!scene) return res.status(404).json({ error: "Scene not found" });

			const data = { sceneId: sid, ms };
			
			if (req.user.roles === "GUEST") data.guestId = req.user.id;
			else data.userId = req.user.id; // USER or ADMIN

			const score = await prisma.score.create({
				data,
				select: {
					id: true,
					ms: true,
					sceneId: true,
					userId: true,
					guestId: true,
					createdAt: true,
				},
			});

			res.status(201).json(score);
		} catch (err) {
			console.error("POST /api/scores failed:", err);
			res.status(500).json({ error: "Failed to save score" });
		}
	}
);

export default r;
