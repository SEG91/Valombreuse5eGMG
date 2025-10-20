/**
 * Vein Odyssey Timeline — Actor-attached (Foundry VTT v13)
 * Works in: <div class="tab timeline" data-group="primary" data-tab="timeline">
 *
 * Features
 * - Reads ordered Journal UUIDs from Actor flag Valombreuse5eGMG.odysseys
 * - Small ↗ open icon, 🗑 remove (edit mode, GM only)
 * - No dynamic sizing, no tab auto-creation (uses your existing tab + container)
 */

const VO_FLAG_SCOPE = "Valombreuse5eGMG";
const VO_FLAG_LIST  = "odysseys";



/* ---------- Helpers ---------- */
function getActorFromApp(app) {
  const doc = app?.document ?? null;
  return doc?.documentName === "Actor" ? doc : null;
}

async function resolveJournal(uuid) {
  try {
    const doc = await fromUuid(uuid);
    return doc?.documentName === "JournalEntry" ? doc : null;
  } catch {
    return null;
  }
}

/* ---------- Flags I/O ---------- */
function getOdysseyUUIDs(actor) {
  const list = actor.getFlag(VO_FLAG_SCOPE, VO_FLAG_LIST);
  return Array.isArray(list) ? [...list] : [];
}
async function setOdysseyUUIDs(actor, uuids) {
  await actor.setFlag(VO_FLAG_SCOPE, VO_FLAG_LIST, uuids);
}

/* ---------- Data collection ---------- */
export async function collectOdysseysForRender(actor) {
  const uuids = getOdysseyUUIDs(actor);
  let odys = [];

  for (let i = 0; i < uuids.length; i++) {
    const uuid = uuids[i];
    const j = await resolveJournal(uuid);
    if (!j) continue;

    odys.push({
      id: j.id,
      uuid: j.uuid,
      name: j.name,
      dateLabel: j.getFlag(VO_FLAG_SCOPE, "odyssey.header.date") || "",
      region:  j.getFlag(VO_FLAG_SCOPE, "odyssey.header.region") || "",
      excerpt: j.getFlag(VO_FLAG_SCOPE, "odyssey.excerpt") || "",
      order:   i + 1
    });
  }

  return odys;
}



/* ---------- Public API ---------- */
export function attachOdysseytoVeinUuid(actor, uuid) {
  const list = getOdysseyUUIDs(actor);
  if (!list.includes(uuid)) {
    list.push(uuid);
    setOdysseyUUIDs(actor, list);
  }
}
