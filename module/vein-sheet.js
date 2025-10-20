
import { attachOdysseytoVeinUuid,collectOdysseysForRender } from "./vein-odyssey-timeline.js";
const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class ValombreuseVeinSheet extends dnd5e.applications.actor.GroupActorSheet {

   /** AppV2 options */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    // Click actions auto-bound via data-action="..."
    actions: {
      rollKnowledge: ValombreuseVeinSheet.#actRollKnowledge,
      powerOpen:     this.#actPowerOpen,
      powerRemove:   this.#actPowerRemove,
      openSecret: this.#onOpenSecret,
      removeSecret: this.#onRemoveSecret,
      odysseyOpen:  this.#actOdysseyOpen,
      odysseyRemove:this.#actOdysseyRemove
    },
    dragDrop: [
    { dragSelector: ".secrets-list .secret-row", dropSelector: ".secrets-section" },
    { dropSelector: ".secrets-section" }
  ]
  }, {inplace: false});

  /* -------------------------------------------- */

  /** @override */
  static PARTS = {
    header: {
      template: "systems/dnd5e/templates/actors/group/header.hbs"
    },
    members: {
      container: { classes: ["tab-body"], id: "tabs" },
      template: "systems/dnd5e/templates/actors/group/members.hbs",
      templates: ["systems/dnd5e/templates/actors/group/member.hbs"],
      scrollable: [""]
    },
    diplomacy: {
      container: { classes: ["tab-body"], id: "tabs" },
      template: "modules/valombreuse5egmg/templates/vein-diplomacy.hbs",
      // (optionnel) permet un scroll interne si besoin
      scrollable: [""]
    },
    secrets: {
      container: { classes: ["tab-body"], id: "tabs" },
      template: "modules/valombreuse5egmg/templates/vein-secret.hbs",
      // (optionnel) permet un scroll interne si besoin
      scrollable: [""]
    },
     powers: {
      container: { classes: ["tab-body"], id: "tabs" },
      template: "modules/valombreuse5egmg/templates/vein-powers.hbs",
      // (optionnel) permet un scroll interne si besoin
      scrollable: [""]
    },
     timeline: {
      container: { classes: ["tab-body"], id: "tabs" },
      template: "modules/valombreuse5egmg/templates/vein-odyssey-timeline.hbs",
      // (optionnel) permet un scroll interne si besoin
      scrollable: [""]
    },
    biography: {
      container: { classes: ["tab-body"], id: "tabs" },
      template: "systems/dnd5e/templates/actors/group/biography.hbs",
      scrollable: [""]
    },
    tabs: {
      id: "tabs",
      classes: ["tabs-right"],
      template: "systems/dnd5e/templates/shared/sidebar-tabs.hbs"
    }
  };

  /* -------------------------------------------- */

  /** @override */
  static TABS = [
    { tab: "members", label: "DND5E.Group.Member.other", icon: "fa-solid fa-users"},
    { tab: "diplomacy", label: "Valombreuse5eGMG.tabs.diplomacy", svg: "modules/valombreuse5egmg/assets/icons/svg/simplediplomacy.svg" },
    { tab: "secrets", label: "Valombreuse5eGMG.tabs.secrets", svg: "modules/valombreuse5egmg/assets/icons/svg/book.svg" },
    { tab: "powers", label: "Valombreuse5eGMG.tabs.powers", svg: "modules/valombreuse5egmg/assets/icons/svg/magic.svg" },
    { tab: "timeline", label: "Valombreuse5eGMG.tabs.timeline", svg: "modules/valombreuse5egmg/assets/icons/svg/scroll-unfurled.svg" },
    { tab: "biography", label: "DND5E.Biography", icon: "fa-solid fa-feather" }
  ];

  /* -------------------------------------------- */
  /*  Properties                                  */
  /* -------------------------------------------- */

  /** @override */
  tabGroups = {
    primary: "members"
  };
    

/** @inheritDoc */
async _prepareContext(options) {
  const context = await super._prepareContext(options);

  // Compute once per render, avoid HBS helpers needing actor
  const veinLevel  = this.#computeVeinLevel(this.actor);
  const awakening  = this.#computeAwakening(this.actor);

  // Namespaced payload for templates
  context.valombreuse ??= {};
  context.valombreuse.veinLevel = veinLevel;
  context.valombreuse.awakening = awakening;
  context.valombreuse.odysseys = await collectOdysseysForRender(this.actor);

  return context;
}


/** @param {Actor} actor */
#computeVeinLevel(actor) {
  if (!actor) return 0;

  // Récupère la valeur d’Awakening (comme ton helper getAwakening)
  const awakening =   this.#computeAwakening(this.actor);

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
}

/** @param {Actor} actor */
#computeAwakening(actor) {
  if (!actor) return 0;

   let numawg = 0;
        
        const items = actor.items?.filter(i => i.type === "loot") ;
        for (let i=0;i<items.length;i++)
        {
            numawg=numawg+items[i].system.quantity;
        }
        return numawg;
}

    /** @override */
    async getData(options) {
    console.log('ValombreuseVeinSheet | getData');
    // The Actor's data
    const source = this.actor.toObject();
    const actorData = this.actor.toObject(false);
    if (actorData.items.length === 0) {
      let items=await game.packs.get("Valombreuse5eGMG.gamemaster-feats").getDocuments().then(index => index.map(entity => entity.toObject(false)));
      let features = items.filter(i => i.type == 'feat');
      // get the item with source custom label = Spell Points
      let caps = features.filter(s => s.system.type.subtype == 'awg');
      const createdItems = await this.actor.createEmbeddedDocuments("Item", caps);
      let caps2 = items.filter(i => i.type == 'facility');
      const createdItems2 = await this.actor.createEmbeddedDocuments("Item", caps2);
      
  }
     else
     {
         let features = actorData.items.filter(i => i.type == 'facility');
         if (features.length<13)
        {
             let Allitems=await game.packs.get("Valombreuse5eGMG.gamemaster-feats").getDocuments().then(index => index.map(entity => entity.toObject(false)));
             let caps = Allitems.filter(i => i.type == 'facility');
             const createdItems = await this.actor.createEmbeddedDocuments("Item", caps);
        }
    }

    const data = await super.getData(options);
    // ✅ Prépare le tableau pour le HBS
    data.odysseys = await collectOdysseysForRender(this.actor);
    return data;
    }   

    /**
   * AppV2: use _onRender to attach additional listeners.
   * Here we delegate 'change' events for your numeric inputs.
   */
  async _onRender(context, options) {
    await super._onRender(context, options);

    // Root element of this sheet
    const root = this.element;

    // Clear previous (if re-rendered)
    if (this.#_detach) this.#_detach();
    const disposers = [];

    // Delegate 'change' for knowledge value
    const onChange = async (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;

      // Knowledge
      if (target.matches(".vein-knowledge-input")) {
        ev.preventDefault();
        const li = target.closest("li.group-member");
        const itemId = li?.dataset.actorId;
        if (!itemId) return;
        const value = Number(target.value) || 0;
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.uses.spent": value }]);
        return;
      }

      // Progress
      if (target.matches(".vein-kingdom-progress")) {
        ev.preventDefault();
        const li = target.closest("li.group-member");
        const itemId = li?.dataset.actorId;
        if (!itemId) return;
        const value = Number(target.value) || 0;
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.progress.value": value }]);
        return;
      }

      // Awakening
      if (target.matches(".vein-awakening-input")) {
        ev.preventDefault();
        const itemId = target.dataset.itemId || target.getAttribute("data-item-id");
        if (!itemId) return;
        const value = Number(target.value) || 0;
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: itemId, "system.uses.spent": value }]);
        return;
      }
    };

    root.addEventListener("change", onChange);
    disposers.push(() => root.removeEventListener("change", onChange));

    // Save disposer
    this.#_detach = () => disposers.splice(0).forEach(fn => fn());
  }

  /* ----------------------- ACTIONS (clicks) ----------------------- */
  // Called when data-action="rollKnowledge"
  static async #actRollKnowledge(event, target) {
    event.preventDefault();
    // Bubble to .rollable element if needed
    const el = target.closest(".rollable") ?? target;
    // If you use a custom _onRoll, keep calling it:
    const app = this; // bound to sheet instance by AppV2
    if (typeof app._onRoll === "function") {
      // Fabricate an event.currentTarget if your legacy code expects it
      Object.defineProperty(event, "currentTarget", { value: el, configurable: true });
      return app._onRoll(event);
    }
  }

  // Open a FEAT (power) row
  static async #actPowerOpen(event, target) {
    event.preventDefault();
     const app = this;

  // Power row
  const li = target.closest(".vp-row");
  if (li?.dataset.itemId) {
    const item = app.actor?.items?.get(li.dataset.itemId);
    if (item) return item.sheet?.render(true);
  }

    // Odyssey row (fallback if same control is reused)
   // const jli = target.closest("li.group-member");
   // const uuid = jli?.dataset.actorId;
   // if (!uuid) return;
   // const doc = (globalThis.fromUuidSync?.(uuid)) ?? await fromUuid(uuid);
   // doc?.sheet?.render(true);
  }

  // Remove a FEAT (power) OR odyssey link
  static async #actPowerRemove(event, target) {
    event.preventDefault();
    const app = this;

    // Power row
  const li = target.closest(".vp-row");
  if (li?.dataset.itemId) {
    await app.actor.deleteEmbeddedDocuments("Item", [li.dataset.itemId]);
    ui.notifications?.info(game.i18n.localize("Valombreuse5eGMG.powers.removed"));
  }

  

    // Odyssey unlink
    /**const jli = target.closest("li.group-member");
    const uuid = jli?.dataset.actorId;
    if (!uuid) return;

    const key = "odysseys";
    const scope = "Valombreuse5eGMG";
    const list = app.actor.getFlag(scope, key) || [];
    const next = list.filter(u => u !== uuid);
    await app.actor.setFlag(scope, key, next);
    await app.render(false);
    ui.notifications?.info("Odyssey removed."); */
  }

  // Ouvrir le Journal depuis son UUID
static async #actOdysseyOpen(event, target) {
  event.preventDefault();
  const uuid = target.dataset.uuid ?? target.closest(".ody-row")?.dataset.uuid;
  if (!uuid) return;
  const doc = (globalThis.fromUuidSync?.(uuid)) ?? await fromUuid(uuid);
  doc?.sheet?.render(true);
}

// Retirer l’UUID de la liste (flag actor Valombreuse5eGMG.odysseys)
static async #actOdysseyRemove(event, target) {
  event.preventDefault();
  const app  = this;
  const uuid = target.dataset.uuid ?? target.closest(".ody-row")?.dataset.uuid;
  if (!uuid) return;

  const list = app.actor.getFlag("Valombreuse5eGMG", "odysseys") ?? [];
  const next = list.filter(u => u !== uuid);
  await app.actor.setFlag("Valombreuse5eGMG", "odysseys", next);
  app.render(false);
}
/**
  // Explicit timeline open (if you renamed the buttons)
  static async #actTimelineOpen(event, target) {
    return this.constructor.#actPowerOpen.call(this, event, target);
  }

  // Explicit timeline remove (if you renamed the buttons)
  static async #actTimelineRemove(event, target) {
    return this.constructor.#actPowerRemove.call(this, event, target);
  }*/

  /* ---------------------- housekeeping ---------------------- */
  #_detach = null;

  /** Clean up listeners if the app is closed */
  async close(options) {
    if (this.#_detach) this.#_detach();
    return super.close(options);
  }

 /* -------------------------------------------- */
  /*  Actions - Secrets (open/remove)              */
  /* -------------------------------------------- */
  static async #onOpenSecret(event, target) {
    event.preventDefault();
    const li = target.closest(".secret-row");
    const itemId = li?.dataset.itemId;
    const item = this.actor?.items?.get(itemId);
    item?.sheet?.render(true);
  }

  static async #onRemoveSecret(event, target) {
    event.preventDefault();
    const li = target.closest(".secret-row");
    const itemId = li?.dataset.itemId;
    if (!itemId) return;
    await this.actor?.deleteEmbeddedDocuments("Item", [itemId]);
  }


  /* -------------------------------------------- */
  /*  DRAG START                                  */
  /* -------------------------------------------- */
  _onDragStart(event) {
    const row = event.target.closest?.(".secrets-list .secret-row");
    if (!row) return super._onDragStart?.(event); // fallback : DnD d’origine

    const itemId = row.dataset.itemId;
    const item = this.actor?.items?.get(itemId);
    if (!item) return;
    event.dataTransfer.setData("text/plain", JSON.stringify(item.toDragData()));
  }


  /* -------------------------------------------- */
  /*  ON DROP (UNIFIÉ)                            */
  /* -------------------------------------------- */
  async _onDrop(event) {
    event.preventDefault();

    const section = event.target.closest?.(".secrets-section");
    let data;
    try {
      data = TextEditor.getDragEventData(event);
      if (!data) data = JSON.parse(event.dataTransfer.getData("text/plain") || "{}");
    } catch {
      return false;
    }
    if (!data) return false;

    // === CAS 1 : Drop dans un panneau de secrets ===
    if (section) {
      const secType = section.dataset.type;
      if (data.type !== "Item") return false;

      let src = data.uuid ? await fromUuid(data.uuid) : null;
      if (!src && data.data) src = new Item.implementation(data.data, { parent: null });
      if (!src) return false;

      // Item déjà sur cet acteur → update flag
      if (src.parent?.id === this.actor.id) {
        await this.actor.updateEmbeddedDocuments("Item", [
          { _id: src.id, ["flags.Valombreuse5eGMG.secretType"]: secType }
        ]);
        return true;
      }

      // Item externe → import dans cet acteur
      const toCreate = src.toObject();
      foundry.utils.setProperty(toCreate, "flags.Valombreuse5eGMG.secretType", secType);
      await this.actor.createEmbeddedDocuments("Item", [toCreate]);
      return true;
    }

    // === CAS 2 : Drop d’un JournalEntry (Odyssey) ===
    if (data.type === "JournalEntry" && data.uuid) {
      await attachOdysseytoVeinUuid(this.actor, data.uuid);
      return true;
    }

    // === CAS 3 : Drop d’un Item standard ===
    if (data.type === "Item") {
      return this._onDropItem(event, data);
    }

    // === Autres cas → comportement par défaut ===
    return super._onDrop?.(event);
  }


  /* -------------------------------------------- */
  /*  DROP ITEM STANDARD                          */
  /* -------------------------------------------- */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;

    const item = await Item.fromDropData(data);
    const itemData = item.toObject();

    // Cas spécial VPW (pouvoirs de Veine)
    if (itemData.type === "feat" && itemData.system?.type?.subtype === "vpw") {
      return await this.actor.createEmbeddedDocuments("Item", [itemData]);
    }

    // Autres items → fallback standard
    return super._onDrop?.(event);
  }


  /** @override 
activateListeners(html) {
  super.activateListeners(html);
  if (!this.isEditable) return;

  // Supporte HTMLElement direct ou un éventuel jQuery wrapper résiduel
  const root = (html instanceof HTMLElement) ? html : html[0];

  // ---------- CHANGE handlers (délégation) ----------
  root.addEventListener("change", async (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;

    // 1) Knowledge input
    if (target.matches(".vein-knowledge-input")) {
      ev.preventDefault();
      const li = target.closest("li.group-member");
      const kingdomId = li?.dataset.actorId;
      if (!kingdomId) return;

      const kingdom = this.actor.items.get(kingdomId);
      if (!kingdom) return;

      const value = Number((target).value) || 0;
      // Update direct (plus simple/robuste en V2)
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: kingdomId, "system.uses.spent": value }
      ]);
      return;
    }

    // 2) Progress input
    if (target.matches(".vein-kingdom-progress")) {
      ev.preventDefault();
      const li = target.closest("li.group-member");
      const kingdomId = li?.dataset.actorId;
      if (!kingdomId) return;

      const kingdom = this.actor.items.get(kingdomId);
      if (!kingdom) return;

      const value = Number((target).value) || 0;
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: kingdomId, "system.progress.value": value }
      ]);
      return;
    }

    // 3) Awakening input
    if (target.matches(".vein-awakening-input")) {
      ev.preventDefault();
      // ex: <input class="vein-awakening-input" data-item-id="...">
      const awakeningId = target?.dataset?.itemId || target.getAttribute("data-item-id");
      if (!awakeningId) return;

      const awakfeat = this.actor.items.get(awakeningId);
      if (!awakfeat) return;

      const value = Number((target).value) || 0;
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: awakeningId, "system.uses.spent": value }
      ]);
      return;
    }
  });

  // ---------- CLICK handlers (délégation) ----------
  root.addEventListener("click", async (ev) => {
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;

    // A) Remove secret
    const btnSecretRemove = t.closest(".secret-remove");
    if (btnSecretRemove) {
      ev.preventDefault();
      const li = btnSecretRemove.closest("li.secret-row");
      const itemId = li?.dataset?.itemId;
      if (!itemId) return;
      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
      return;
    }

    // B) Ouvrir (power / timeline)
    const btnOpen = t.closest(".power-open, .timeline-open");
    if (btnOpen) {
      ev.preventDefault();

      // Cas 1: ligne de power (feat)
      const powerLi = btnOpen.closest(".power-row");
      if (powerLi) {
        const id = powerLi.dataset.itemId;
        const item = this.actor?.items?.get(id);
        if (item) item.sheet?.render(true);
        return;
      }

      // Cas 2: ligne d’odyssey (journal)
      const jLi = btnOpen.closest("li.group-member");
      const uuid = jLi?.dataset.actorId;
      if (!uuid) return;

      // fromUuidSync existe encore; sinon bascule en async with await fromUuid(uuid).
      const doc = fromUuidSync ? fromUuidSync(uuid) : await fromUuid(uuid);
      if (doc) doc.sheet?.render(true);
      return;
    }

    // C) Remove (power / timeline)
    const btnRemove = t.closest(".power-remove, .timeline-remove");
    if (btnRemove) {
      ev.preventDefault();

      // Cas 1: suppression d’un power (feat)
      const powerLi = btnRemove.closest(".power-row");
      if (powerLi) {
        const id = powerLi.dataset.itemId;
        if (!id) return;
        await this.actor.deleteEmbeddedDocuments("Item", [id]);
        return;
      }

      // Cas 2: suppression d’une odyssey (retirer l’UUID du flag)
      const jLi = btnRemove.closest("li.group-member");
      const uuid = jLi?.dataset.actorId;
      if (!uuid) return;

      const list = this.actor.getFlag("Valombreuse5eGMG", "odysseys") || [];
      const next = list.filter(u => u !== uuid);
      await this.actor.setFlag("Valombreuse5eGMG", "odysseys", next);
      await this.render(false);
      ui.notifications?.info("Odyssey removed.");
      return;
    }

    // D) Rollable (déclenche ton handler de jet)
    const roll = t.closest(".rollable");
    if (roll) {
      ev.preventDefault();
      // Si _onRoll attend event.currentTarget, force-le :
      const originalCurrent = ev.currentTarget;
      Object.defineProperty(ev, "currentTarget", { value: roll, configurable: true });
      try {
        this._onRoll?.(ev);
      } finally {
        // restauration facultative
        Object.defineProperty(ev, "currentTarget", { value: originalCurrent, configurable: true });
      }
      return;
    }
  });
}*/

  
    /**
     * Initiates a roll from any kind depending on the "data-roll-type" attribute
     * @param event the roll event
     * @private
     */
     async _onRoll(event) {
        const elt = $(event.currentTarget)[0];
        const rolltype = elt.attributes["data-roll-type"].value;
       

        const configJet = {
            showGM : true,
          };

          if (event.shiftKey)
          {
            configJet.checkGM = true;
          }


        switch (rolltype) {
            
            case "rollKnowledge" :
                 let Rang = elt.attributes["data-rolling-value"].value;
                 let Title = elt.attributes["data-rolling-title"].value;
                 let textchat=Title+" "+game.i18n.format("Valombreuse5eGMG.vein.knowledge");
                 const data = this.actor.getRollData();
                 const actor=this.actor
                 let Knowledgeformula=Rang+"+d20";
                await this.rollToChat({
                formula: Knowledgeformula,
                data,
                actor,
                flavor: textchat,
                rollMode: CONFIG.Dice.rollModes.ROLL   // or GMROLL / BLINDROLL / SELFROLL
            });
            break;
                
        }
    }
    
    /**
 * Roll a formula and post it to chat (Foundry VTT v13+).
 * @param {object} opts
 * @param {string} opts.formula     Dice formula, e.g. "2d20kh + @prof + @mod"
 * @param {object} [opts.data={}]   Data object for @paths (e.g. actor.getRollData())
 * @param {Actor}  [opts.actor]     Used for ChatMessage speaker
 * @param {string} [opts.flavor]    Small title/label above the roll
 * @param {string} [opts.rollMode]  One of CONFIG.Dice.rollModes (e.g. "roll","gmroll","blindroll","selfroll")
 * @param {User[]} [opts.whisper]   Whisper recipients; ignored unless rollMode implies whisper
 */
async rollToChat({
  formula,
  data = {},
  actor,
  flavor,
  rollMode = game.settings.get("core", "rollMode"),
  whisper
} = {}) {
  // 1) Build & evaluate
  const roll = new Roll(formula, data);
  await roll.evaluate();

  // 2) Prepare message data
  const messageData = {
    user: game.user.id,
    speaker: actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker(),
    flavor, // Shown above the rendered roll
    // content will be filled by roll.render() via Roll.CHAT_TEMPLATE
    whisper: whisper?.map(u => (u.id ?? u)) // allow array of Users or ids
  };

  // 3) Post to chat (create=true sends it right away)
  return await roll.toMessage(messageData, {
    create: true,
    rollMode // from CONFIG.Dice.rollModes
  });
}

 /* -------------------------------------------- */
    /* DROP EVENTS CALLBACKS                        */
    /* -------------------------------------------- */

    /** @override 
    async _onDrop(event) {
        event.preventDefault();
        
        // Get dropped data
        let data;
        try {
            data = JSON.parse(event.dataTransfer.getData('text/plain'));
        } catch (err) {
            return false;
        }
        if (!data) return false;

        // Case 1 - Dropped Item
        if (data.type === "Item") {
            return this._onDropItem(event, data);
        }
        else if (data.type === "JournalEntry") {
            return attachOdysseytoVeinUuid(this.actor,data.uuid);
        }
        else
          return super._onDrop(event);
    }*/

/**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    // let authorized = true;

    // let itemData = await this._getItemDropData(event, data);
    const item = await Item.fromDropData(data);
    const itemData = item.toObject();
    switch (itemData.type) {
        case "feat" :
            {
              if (itemData.system.type.subtype ==="vpw")
                {
                  return await this.actor.createEmbeddedDocuments("Item", [itemData]);
                 }
                 else
                  return super._onDrop(event);
            }
        default:
            return super._onDrop(event);
    }
}*/

}
