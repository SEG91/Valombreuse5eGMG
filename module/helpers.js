
export const VE_MODULE_NAME = 'Valombreuse5eGMG';

export const registerHandlebarsHelpers = function () {


    Handlebars.registerHelper('getVeinMembers', function (items) {
        return items.system.members;
    });

     Handlebars.registerHelper('getVeinKingdoms', function (iActor) {
        return iActor.items.filter(i => i.type == 'facility');
    });

    Handlebars.registerHelper('getSecretType', function () {
        let sType = [];
        sType.push(game.i18n.format(VE_MODULE_NAME + ".secretworld"));
        sType.push(game.i18n.format(VE_MODULE_NAME + ".secretbloodline"));
        sType.push(game.i18n.format(VE_MODULE_NAME + ".secretorder"));
        sType.push(game.i18n.format(VE_MODULE_NAME + ".secretgenesis"));
        return sType;
    });

    Handlebars.registerHelper('getAwakening', function (iActor) {
        let numawg = 0;
        if (!iActor) return [];
        const items = iActor.items?.filter(i => i.type === "loot") ;
        for (let i=0;i<items.length;i++)
        {
            numawg=numawg+items[i].system.quantity;
        }
        return numawg;
    });

    Handlebars.registerHelper('getAwakeningID', function (iActor) {
        const actorData = this.actor.toObject(false);
        let features = actorData.items.filter(i => i.type == 'feat');
        // get the item with source custom label = Spell Points
        let caps = features.filter(s => s.system.type.subtype == 'awg');
        let id="";
        if (caps.length>0)
            id= caps[0]._id;

        return id;
    });

    Handlebars.registerHelper("debug", function(optionalValue) {
        console.log("Current Context");
        console.log("====================");
        console.log(this);
      
        if (optionalValue) {
          console.log("Value");
          console.log("====================");
          console.log(optionalValue);
        }
      });

      // Supprime les balises HTML pour un tooltip propre
Handlebars.registerHelper("stripHTML", function (html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").trim();
});

/**
 * Récupère les Items de type "secret" pour un acteur,
 * filtrés par system.type.subtype === typeKey, triés par "niveau".
 * @param {Actor} actor
 * @param {string} typeKey  "genesis" | "world" | "bloodline" | "order"
 */
Handlebars.registerHelper("getSecretsByType", function (actor, typeKey) {
  if (!actor) return [];
  const itemslist = actor.items?.filter(i => i.type === "loot") ;
  let items= itemslist.filter(i => i.system.type?.subtype === typeKey);
  // Détermine un "niveau" numérique (quantity > uses.spent > level > rank)
  const levelOf = (it) => {
    return it.system.quantity;
  };

  return items.sort((a, b) => levelOf(b) - levelOf(a));
});

Handlebars.registerHelper("getSecretTypeOptions", function () {
  return [
    { value: "secretgenesis",   label: game.i18n.localize("Valombreuse5eGMG.secretgenesis") },
    { value: "secretworld",     label: game.i18n.localize("Valombreuse5eGMG.secretworld") },
    { value: "secretbloodline", label: game.i18n.localize("Valombreuse5eGMG.secretbloodline") },
    { value: "secretorder",     label: game.i18n.localize("Valombreuse5eGMG.secretorder") }
  ];
});

/** Affiche le niveau en lisant quantity > uses.spent > level > rank */
Handlebars.registerHelper("getSecretLevel", function (item) {
  return item.system.quantity;
});

Handlebars.registerHelper("getVeinLevel", function (actor) {
  if (!actor) return 0;

  // Récupère la valeur d’Awakening (comme ton helper getAwakening)
  const awakening = actor.system?.awakening ?? 0;

  // Table des seuils (niveau → éveil requis)
  const thresholds = [
    { level: 1, req: 5 },
    { level: 2, req: 12 },
    { level: 3, req: 20 },
    { level: 4, req: 30 },
    { level: 5, req: 45 },
    { level: 6, req: 60 },
    { level: 7, req: 80 },
    { level: 8, req: 100 },
    { level: 9, req: 125 },
    { level: 10, req: 150 },
    { level: 11, req: 170 },
    { level: 12, req: 190 },
    { level: 13, req: 210 },
    { level: 14, req: 235 },
    { level: 15, req: 260 },
    { level: 16, req: 290 },
    { level: 17, req: 320 },
    { level: 18, req: 350 },
    { level: 19, req: 380 },
    { level: 20, req: 420 }
  ];

  // Cherche le plus haut niveau atteint selon l’Awakening
  let level = 0;
  for (const t of thresholds) {
    if (awakening >= t.req) level = t.level;
  }

  return level;
});

// Retourne la liste triée des seuils qui ont au moins un pouvoir
Handlebars.registerHelper("seuilsWithPowers", function (actor) {
  if (!actor) return [];
  const arr = [];
  for (const i of actor.items ?? []) {
    if (i.system.type.subtype !== "vpw") continue;
    const lvl = Number(foundry.utils.getProperty(i, "system.prerequisites.level") ?? 0);
    if (!Number.isFinite(lvl) || lvl <= 0) continue;
    arr.push(lvl);
  }
  // uniques + triés
  return [...new Set(arr)].sort((a, b) => a - b);
});

// Powers d’un seuil donné
Handlebars.registerHelper("getVeinPowersBySeuil", function (actor, seuil) {
  if (!actor) return [];
  const wanted = Number(seuil);
  let caps = (actor.items ?? [])
    .filter(i => i.system.type.subtype === "vpw"
              && Number(foundry.utils.getProperty(i, "system.prerequisites.level") ?? 0) === wanted)
    .sort((a, b) => (a.name || "").localeCompare(b.name || "", game.i18n.lang));
    return caps;
});

// Petit utilitaire range si besoin (1..20)
Handlebars.registerHelper("range", function (from, to, options) {
  let out = "";
  for (let i = from; i <= to; i++) out += options.fn(i);
  return out;
});


Handlebars.registerHelper("range", function(from, to, options) {
  let result = "";
  for (let i = from; i <= to; i++) {
    result += options.fn(i);
  }
  return result;
});

Handlebars.registerHelper("defaultArray", function (arr) {
  return Array.isArray(arr) ? arr : [];
});


}

