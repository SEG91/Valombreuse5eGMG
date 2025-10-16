/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

import { ValombreuseVeinSheet } from "./vein-sheet.js";
import { ValombreuseSecretSheet } from "./secret-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { registerHandlebarsHelpers } from "./helpers.js";

import { OdysseyEntrySheet } from "./odyssey-entry-sheet.js";
import { installOdysseyJournalButton } from "./odyssey-ui.js";
import { OdysseyManager } from "./odyssey-manager.js";

export const VE_MODULE_NAME = 'Valombreuse5eGMG';
const DSC = foundry.applications.apps.DocumentSheetConfig;



Hooks.once("init", async function () {

    console.info("----------   ValombreuseGMG : System Initializing...");
    // add a class feature subtype
  game.dnd5e.config.featureTypes.feat.subtypes.awg = game.i18n.format(VE_MODULE_NAME + ".awgSubtype");
  game.dnd5e.config.featureTypes.feat.subtypes.vpw = game.i18n.format(VE_MODULE_NAME + ".veinpowerSubtype");
  game.dnd5e.config.facilities.types.kingdom = game.i18n.format(VE_MODULE_NAME + ".kingdom");
  game.dnd5e.config.lootTypes.secretworld = { label: game.i18n.format(VE_MODULE_NAME + ".secretworld")};
game.dnd5e.config.lootTypes.secretbloodline = { label: game.i18n.format(VE_MODULE_NAME + ".secretbloodline")};
game.dnd5e.config.lootTypes.secretorder = { label: game.i18n.format(VE_MODULE_NAME + ".secretorder")};
game.dnd5e.config.lootTypes.secretgenesis = { label: game.i18n.format(VE_MODULE_NAME + ".secretgenesis")};

    // Register actor sheets
  Actors.registerSheet("dnd5e", ValombreuseVeinSheet, {
    types: ["group"], 
    makeDefault: true,
    label: "Valombreuse5eGMG.SheetClassGroup"
 });

 DocumentSheetConfig.registerSheet(Item, "dnd5e", ValombreuseSecretSheet, {
    makeDefault: true,
    types: ["loot"],
    label: "Valombreuse5eGMG.SheetClassSecret"
  });


 

 await preloadHandlebarsTemplates();
  registerHandlebarsHelpers();
  installOdysseyJournalButton();

    console.info("ValombreuseGMG : Init Done");

});

Hooks.once("setup", () => {
  console.info("ValombreuseGMG : Setup check...");

  
  console.info("ValombreuseGMG : Setup done.");
});

Hooks.once("i18nInit", async function () {
    console.info("ValombreuseGMG : i18nInit check...");

    foundry.applications.apps.DocumentSheetConfig.registerSheet(JournalEntry, "Valombreuse5eGMG", OdysseyEntrySheet, {
        canBeDefault: false, 
        makeDefault: false,
        label: `${game.i18n.localize('Valombreuse5eGMG.Sheet.Odyssey')}`,
    });

    console.info("ValombreuseGMG : i18nInit done.");
});


 /* -------------------------------------------- */
/*  READY                                       */
/* -------------------------------------------- */
Hooks.once("ready", async function () {
  console.info("ValombreuseGMG : Ready...");
game.odysseymanager = new OdysseyManager();
 
  console.info("ValombreuseGMG : Ready done.");
});

/* -------------------------------------------- */
/*  AUTO-OUVERTURE DE LA BONNE FEUILLE          */
/* -------------------------------------------- */
Hooks.on("renderJournalEntry", async (app, html) => {
  try {
    const doc = app.document ?? app.object;
    if (!(doc instanceof JournalEntry)) return;

    const isOdy = doc.getFlag(VE_MODULE_NAME, "type") === "odyssey";
    if (!isOdy) return;
    if (app instanceof OdysseyEntrySheet) return;

    console.log(`${VE_MODULE_NAME} | Switching to OdysseyEntrySheet for`, doc.name);

    await app.close({ force: true });
    const sheet = new OdysseyEntrySheet(doc, app.options);
    sheet.render(true);
  } catch (err) {
    console.error(`${VE_MODULE_NAME} | renderJournalEntry switch failed`, err);
  }
});


