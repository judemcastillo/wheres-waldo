import { Router } from "express";
import bcrypt from "bcrypt";
import passport from "../auth.js";
import { prisma } from "../prisma.js";
import { issueJWT } from "../utils/token.js";

const r = Router();

// /api/auth/
r.post("/register", async (req, res) => {
	const { name, email, password } = req.body || {};

	try {
		if (!name || !email || !password)
			return res.status(400).json({ error: "name, email, password required" });

		const exists = await prisma.user.findUnique({ where: { email } });

		if (exists)
			return res.status(409).json({ message: "Email already in use" });
		const hash = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: { name, email, password: hash, roles: "USER" },
		});
		const token = issueJWT(user);
		res.json({
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.roles,
			},
		});
	} catch (e) {
		res.status(400).json({ error: "Email already in use" });
	}
});

r.post("/login", async (req, res, next) => {
	const { email, password } = req.body;
	try {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			return res.status(401).json({ error: "Invalid email or password" });
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ error: "Invalid email or password" });
		}
		const token = issueJWT(user);
		return res.status(200).json({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				roles: user.roles,
			},
			token,
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/auth/guest
r.post("/guest", async (_req, res) => {
	try {
		// 4-digit code (0000–9999). Change width if you want more/less digits.
		const code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
		const guest = await prisma.guestSession.create({
			data: { name: `Guest ${code}` }, // roles defaults to GUEST in schema
			select: { id: true, name: true, roles: true },
		});
		const token = issueJWT(guest); // your { roles } + sub=id token
		res.status(201).json({ token, guest });
	} catch (e) {
		console.error("POST /api/auth/guest failed:", e);

		// Common Prisma codes
		if (e.code === "P2021") {
			return res.status(500).json({
				error: "GuestSession table not found. Did you run migrations?",
			});
		}
		if (e.code === "P2002") {
			return res
				.status(409)
				.json({ error: "Guest name already exists. Retry." });
		}
		// JWT secret missing / invalid
		if (e.name === "JsonWebTokenError") {
			return res
				.status(500)
				.json({ error: "JWT misconfiguration (JWT_SECRET missing/invalid)" });
		}

		return res.status(500).json({ error: "Failed to create guest" });
	}
});

r.get("/me", passport.authenticate("jwt", { session: false }), (req, res) => {
	res.json({ auth: req.user });
});

export default r;
