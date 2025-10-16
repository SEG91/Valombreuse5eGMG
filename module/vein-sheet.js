
import { attachOdysseytoVeinUuid,collectOdysseysForRender } from "./vein-odyssey-timeline.js";


export class ValombreuseVeinSheet extends dnd5e.applications.actor.GroupActorSheet {

    static defaultHeight() {
        let height;
            height = 920;
        return height;
    }

    /** @override */
    static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "actor", "group"],
      template: "modules/valombreuse5egmg/templates/vein-sheet.hbs",
      tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "diplomacy"}]
    });
    }


    /** @inheritDoc */
  async _prepareContext(options) {
    console.log('ValombreuseVeinSheet | _prepareContext');
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

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;

        html.on('change', '.vein-knowledge-input', async (ev) => {
            ev.preventDefault();
            const input = ev.currentTarget;
            const li = input.closest('li.group-member');
            const KingdomId = li?.dataset.actorId;
            if (!KingdomId) return;
            
            const Kingdom = this.actor.items.get(KingdomId);
            if (!Kingdom) return;
            let itemData = Kingdom.toObject();
            const value = Number(input.value);
            itemData.system.uses.spent=value;
    
            return this.actor.updateEmbeddedDocuments("Item",[itemData]);
     });

        html.on('change', '.vein-kingdom-progress', async (ev) => {
            ev.preventDefault();
            const input = ev.currentTarget;
            const li = input.closest('li.group-member');
            const KingdomId = li?.dataset.actorId;
            if (!KingdomId) return;
            
            const Kingdom = this.actor.items.get(KingdomId);
            if (!Kingdom) return;
            let itemData = Kingdom.toObject();
            const value = Number(input.value);
            itemData.system.progress.value=value;
    
            return this.actor.updateEmbeddedDocuments("Item",[itemData]);
     });

        html.on('change', '.vein-awakening-input', async (ev) => {
            ev.preventDefault();
            const input = ev.currentTarget;
            const awakeningId = input.attributes[1].nodeValue;   // ← directement depuis data-*
            if (!awakeningId) return;

            const value = Number(input.value);
            const awakfeat = this.actor.items.get(awakeningId);
            if (!awakfeat) return;

            return  this.actor.updateEmbeddedDocuments("Item", [{_id: awakeningId,"system.uses.spent": value}]);
        });

        html.on("click", ".secret-remove", async (ev) => {
         ev.preventDefault();
         const li = ev.currentTarget.closest("li.secret-row");
         if (!li) return;
          const itemId = li.dataset.itemId;
         if (!itemId) return;

      await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
 
    });

    // Ouvrir la fiche d'un pouvoir (feat)
       html.on("click", ".power-open", ev => {
        ev.preventDefault();
        const li = ev.currentTarget.closest(".power-row");
        if (li) {
            const id = li?.dataset.itemId;
            const item = this.actor?.items?.get(id);
            if (item) item.sheet?.render(true);
        }
       else {
          const jli = ev.currentTarget.closest('li.group-member');
          const uuid = jli?.dataset.actorId;
          if (!uuid) return;
          const doc = fromUuidSync(uuid);
          if (doc) doc.sheet?.render(true);
        }
    });

   // Supprimer le pouvoir
      html.on("click", ".power-remove", async ev => {
        ev.preventDefault();
        const Thisactor= this.actor;
         const li = ev.currentTarget.closest(".power-row");
        if (li)
        {
          const id = li?.dataset.itemId;
          if (!id) return;
        await this.actor.deleteEmbeddedDocuments("Item", [id]);
       }
     else {
      const jli = ev.currentTarget.closest('li.group-member');
      const uuid = jli?.dataset.actorId;
      if (!uuid) return;
      const list = this.actor.getFlag("Valombreuse5eGMG", "odysseys") || [];
      const next = list.filter(u => u !== uuid);
      await this.actor.setFlag("Valombreuse5eGMG", "odysseys", next);
      await this.render(false);
      ui.notifications?.info("Odyssey removed.");
   }
     });

        // Initiate a roll
        html.find('.rollable').click(ev => {
            ev.preventDefault();
            return this._onRoll(ev);
        });
    }

  
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

    /** @override */
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
    }

/**
     * Handle dropping of an item reference or item data onto an Actor Sheet
     * @param {DragEvent} event     The concluding DragEvent which contains drop data
     * @param {Object} data         The data transfer extracted from the event
     * @return {Object}             OwnedItem data to create
     * @private
     */
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
}

}
