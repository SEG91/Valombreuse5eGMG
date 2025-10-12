


export class OdysseyManager {

    constructor() {
    this._creationQueue = new Set();
  }

  
  async dumpRegisteredSheets() {
  try {
    const DSC = foundry.applications.apps.DocumentSheetConfig;
    const out = [];

    // Liste de classes de Documents connues – ajoute/enlève ce dont tu as besoin
    const classes = [
      foundry.documents.Actor,
      foundry.documents.Item,
      foundry.documents.JournalEntry,
      foundry.documents.Scene,
      foundry.documents.Macro,
      foundry.documents.RollTable,
      foundry.documents.Cards
    ].filter(Boolean);

    for (const DocClass of classes) {
      const reg = DSC.getSheets?.(DocClass);
      if (!reg) continue;

      // v13 retourne un Map(namespace -> { cls, types, label, makeDefault, canBeDefault })
      if (reg instanceof Map) {
        for (const [namespace, cfg] of reg.entries()) {
          out.push({
            Document: DocClass.documentName || DocClass.name,
            Namespace: namespace,
            Class: cfg?.cls?.name || "(unknown)",
            Label: cfg?.label || "",
            Types: Array.isArray(cfg?.types) ? cfg.types.join(", ") : "",
            Default: !!cfg?.makeDefault
          });
        }
      }
    }

    console.group("📜 Registered Document Sheets (v13)");
    console.table(out);
    console.groupEnd();

    if (!out.length) {
      console.warn("Aucune sheet listée. Vérifie que tu as bien appelé registerSheet sur les classes *namespacées* (ex: foundry.documents.JournalEntry) et que ton code d’enregistrement s’exécute bien dans le hook 'init'.");
    }
    return out;
  } catch (e) {
    console.error("dumpRegisteredSheets error:", e);
    return [];
  }
}



    async createOdysseyJournal(name = "New Odyssey") {
        const creationKey = `odyssey-${name}`;
        if (this._creationQueue.has(creationKey)) return;
            this._creationQueue.add(creationKey);

        this.dumpRegisteredSheets();
        const journalSheets = foundry.applications.apps.DocumentSheetConfig.sheets;
   
         try {
             const journalData = {
             name: name,
            flags: {
                 "Valombreuse5eGMG": {
                 type: "odyssey",
                 data: {
                    description: "",
                    notes: "",
                },
             },
            core: { sheetClass: "Valombreuse5eGMG.OdysseyEntrySheet" },
         },
        pages: [{ name: "Overview", type: "text", text: { content: `<h1>${name}</h1><p>Odyssey overview...</p>` } }],
      };
        return await JournalEntry.create(journalData);
        } finally {
            this._creationQueue.delete(creationKey);
     }
    }
}
