// prisma/seed.js (ESM)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Icon files expected under /public/Icons/*
const ICONS = {
  Waldo:  "/Icons/Waldo.png",
  Wenda:  "/Icons/Wenda.png",
  Oswald: "/Icons/Oswald.png",
  Wizard: "/Icons/Wizard.png",
};

// All coords normalized 0..1
const SCENES = [
  {
    url: "/Scene1.jpeg",
    answers: [
      { character: "Waldo",  x: 0.432, y: 0.755 },
      { character: "Wizard", x: 0.656, y: 0.776 },
      { character: "Wenda",  x: 0.438, y: 0.603 },
    ],
  },
  {
    url: "/Scene2.jpeg",
    answers: [
      { character: "Waldo",  x: 0.573, y: 0.353 },
      { character: "Wenda",  x: 0.390, y: 0.325 },
      { character: "Oswald", x: 0.420, y: 0.599 },
      { character: "Wizard", x: 0.850, y: 0.850 },
    ],
  },
  {
    url: "/Scene3.jpeg",
    answers: [
      { character: "Waldo",  x: 0.476, y: 0.221 },
      { character: "Wenda",  x: 0.229, y: 0.331 },
      { character: "Wizard", x: 0.693, y: 0.167 },
    ],
  },
  {
    url: "/Scene4.jpeg",
    answers: [
      { character: "Waldo",  x: 0.169, y: 0.841 },
      { character: "Wenda",  x: 0.755, y: 0.761 },
      { character: "Wizard", x: 0.290, y: 0.136 },
      { character: "Oswald", x: 0.864, y: 0.819 },
    ],
  },
];

// helper: only include keys when they have values (avoid passing nulls)
const defined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

async function ensureCharacters(names) {
  for (const name of names) {
    await prisma.character.upsert({
      where: { name },
      update: { iconUrl: ICONS[name] ?? `/Icons/${name}.png` },
      create: { name, iconUrl: ICONS[name] ?? `/Icons/${name}.png` },
    });
  }
}

async function ensureSceneByUrl(url, name) {
  // If you later add @unique on url, switch to .upsert
  const existing = await prisma.scene.findFirst({ where: { url }, select: { id: true } });
  if (existing) return existing.id;

  // Only include fields that exist in your current schema
  // (name is optional, width/height are optional in your schema)
  const data = defined({ url, name });
  try {
    const created = await prisma.scene.create({
      data,
      select: { id: true },
    });
    return created.id;
  } catch (e) {
    console.error(`❌ scene.create failed for url=${url}`, e);
    throw e;
  }
}

async function ensureAnswer(sceneId, { character, x, y }) {
  const ch = await prisma.character.findUnique({
    where: { name: character },
    select: { id: true },
  });
  if (!ch) {
    console.warn(`⚠️ character not found: ${character} (skipping)`);
    return;
  }
  await prisma.sceneCharacter.upsert({
    where: { sceneId_characterId: { sceneId, characterId: ch.id } },
    update: { x, y, w: null, h: null },
    create: { sceneId, characterId: ch.id, x, y, w: null, h: null },
  });
}

async function main() {
  // 0) sanity: validate schema matches client
  // (run `npx prisma validate` before seeding in CI/CD)

  // 1) characters first
  const allNames = Array.from(new Set(SCENES.flatMap(s => s.answers.map(a => a.character))));
  await ensureCharacters(allNames);

  // 2) scenes + answers
  for (const s of SCENES) {
    const sceneId = await ensureSceneByUrl(s.url, s.name ?? undefined);
    for (const a of s.answers) {
      await ensureAnswer(sceneId, a);
    }
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    // Print the full Prisma error so we see field-level detail
    console.error("❌ Seed failed:");
    console.dir(e, { depth: 5 });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
