import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";


export function issueJWT(user) {
	const payload = {
		roles: user.roles,
		sub: user.id,
		name:user.name
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: "1d",
	});
	return token;
}
