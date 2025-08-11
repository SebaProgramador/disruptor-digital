// src/lib/getDb.js
export async function getDb() {
  const mod = await import("../firebase"); // importa después de montar
  return mod.db;
}
