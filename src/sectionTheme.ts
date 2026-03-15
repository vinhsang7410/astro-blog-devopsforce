export type SectionName = "labs" | "notes" | "projects";

export const sectionThemes = {
	labs: {
		label: "Labs",
		eyebrow: "Experiment Log",
		description: "Working notes from prototypes, failure cases, and infrastructure drills.",
		singular: "lab",
		cardLabel: "Experiment",
		accent: "255, 108, 55",
		accentSoft: "255, 236, 227",
		surface: "linear-gradient(135deg, rgba(255,108,55,0.18), rgba(255,255,255,0.96) 54%)",
		glow: "radial-gradient(circle at top left, rgba(255,108,55,0.3), transparent 55%)",
	},
	notes: {
		label: "Notes",
		eyebrow: "Field Notes",
		description: "Quick references, snippets, and operational reminders worth keeping nearby.",
		singular: "note",
		cardLabel: "Quick Note",
		accent: "12, 122, 117",
		accentSoft: "224, 247, 244",
		surface: "linear-gradient(135deg, rgba(12,122,117,0.16), rgba(255,255,255,0.96) 56%)",
		glow: "radial-gradient(circle at top left, rgba(12,122,117,0.28), transparent 55%)",
	},
	projects: {
		label: "Projects",
		eyebrow: "Build Archive",
		description: "Shipped work, implementation notes, and hands-on architecture writeups.",
		singular: "project",
		cardLabel: "Build Story",
		accent: "38, 84, 210",
		accentSoft: "231, 239, 255",
		surface: "linear-gradient(135deg, rgba(38,84,210,0.18), rgba(255,255,255,0.96) 58%)",
		glow: "radial-gradient(circle at top left, rgba(38,84,210,0.3), transparent 55%)",
	},
} as const;
