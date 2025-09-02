import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
	// Characters
	const waldo = await prisma.character.upsert({
		where: { name: "Waldo" },
		update: {},
		create: { name: "Waldo", iconUrl: "/icons/Waldo.png" },
	});
	const wizard = await prisma.character.upsert({
		where: { name: "Wizard" },
		update: {},
		create: { name: "Wizard", iconUrl: "/icons/Wizard.png" },
	});
	const wenda = await prisma.character.upsert({
		where: { name: "Wenda" },
		update: {},
		create: { name: "Wenda", iconUrl: "/icons/Wenda.png" },
	});
	const oswald = await prisma.character.upsert({
		where: { name: "Oswald" },
		update: {},
		create: { name: "Oswald", iconUrl: "/icons/Oswald.png" },
	});

	// Scene
	const scene = await prisma.scene.upsert({
		where: { id: 1 },
		update: {},
		create: {
			id: 1,
			url: "/Scene1.jpeg", // place file under server/public/static
		},
	});

	// Answers (normalized 0..1)
	const answers = [
		{
			characterId: waldo.id,
			sceneId: scene.id,
			x: 0.432,
			y: 0.755,
		},
		{
			characterId: wizard.id,
			sceneId: scene.id,
			x: 0.656,
			y: 0.776,
		},
		{
			characterId: wenda.id,
			sceneId: scene.id,
			x: 0.438,
			y: 0.603,
		},
		{
			characterId: oswald.id,
			sceneId: scene.id,
			x: 0.593,
			y: 0.949,
		},
	];

	for (const a of answers) {
		await prisma.sceneCharacter.upsert({
			where: {
				sceneId_characterId: { sceneId: a.sceneId, characterId: a.characterId },
			},
			update: { x: a.x, y: a.y, w: a.w, h: a.h },
			create: a,
		});
	}

	console.log("Seeded.");
}

main().finally(() => prisma.$disconnect());
