import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { prisma } from "./prisma.js";

// JWT: supports user or guest
passport.use(
	new JwtStrategy(
		{
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: process.env.JWT_SECRET,
		},
		async (payload, done) => {
			try {
				const id = Number(payload.sub);
				if (payload.roles === "USER" || payload.roles === "ADMIN") {
					const user = await prisma.user.findUnique({
						where: { id },
						select: { id: true, name: true, email: true, roles: true },
					});
					if (!user) return done(null, false);
					return done(null, user); // { id, name, email, roles }
				}
				if (payload.roles === "GUEST") {
					const guest = await prisma.guestSession.findUnique({
						where: { id },
					});
					if (!guest) return done(null, false);
					return done(null, guest);
				}
				return done(null, false);
			} catch (e) {
				done(e);
			}
		}
	)
);

export default passport;
