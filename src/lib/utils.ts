import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeStringify(obj: unknown): string | undefined {
  try { return JSON.stringify(obj) } catch { return undefined }
}

// Generer kort kode ala "finnkode" (numerisk) på 6–9 siffer
export function generateShortCode(): string {
  // Timestamp + random, begrenset lengde og uten kollisjon
  const base = Date.now().toString().slice(-7) // siste 7 siffer av timestamp
  const rand = Math.floor(100 + Math.random() * 900).toString() // 3 siffer
  return `${base}${rand}` // 10 siffer totalt; kan kuttes ned om ønskelig
}
