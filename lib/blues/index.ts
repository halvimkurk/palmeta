import notesJson from "@/data/blues/notes.json";
import type { BlueNote, BluesCatalog } from "@/lib/blues/types";

const catalog = notesJson as BluesCatalog;

export function getBluesCatalog(): BluesCatalog {
  return catalog;
}

export function getBlueNotes(): BlueNote[] {
  return [...catalog.notes].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getBlueNoteBySlug(slug: string): BlueNote | undefined {
  return catalog.notes.find((n) => n.slug === slug);
}
