/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

import { ValombreuseVeinSheet } from "./vein-sheet.js";
import { ValombreuseSecretSheet } from "./secret-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { registerHandlebarsHelpers } from "./helpers.js";


export const VE_MODULE_NAME = 'Valombreuse5eGMG';




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

 

 // Preload Handlebars Templates
    preloadHandlebarsTemplates();

    // Register Handlebars helpers
    registerHandlebarsHelpers();


    
    console.info("ValombreuseGMG : Init Done");

});

Hooks.once("setup", () => {
  console.info("ValombreuseGMG : Setup...");
});


  /* -------------------------------------------- */

Hooks.once("ready", function () {
  console.info("ValombreuseGMG : Ready...");
});

