import { Router } from "express";
import { prisma } from "../prisma.js";

const r = Router();

// /api/scenes List scenes (do not reveal answers)
r.get("/", async (_req, res) => {
	const list = await prisma.scene.findMany({
		select: {
			id: true,
			name: true,
			url: true,
			width: true,
			height: true,
			answers: {
				select: {
					character: { select: { id: true, name: true, iconUrl: true } },
				},
			},
		},
	});
	res.json(list);
});

// /api/scenes/:id Scene detail with character list (names/icons only)
r.get("/:id", async (req, res) => {
	const id = Number(req.params.id);
	const scene = await prisma.scene.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			url: true,
			width: true,
			height: true,
			answers: {
				select: {
					character: { select: { id: true, name: true, iconUrl: true } },
				},
			},
		},
	});
	if (!scene) return res.status(404).json({ error: "Not found" });
	const characters = scene.answers.map((a) => a.character);
	res.json({
		id: scene.id,
		name: scene.name,
		url: scene.url,
		width: scene.width,
		height: scene.height,
		characters,
	});
});

export default r;
