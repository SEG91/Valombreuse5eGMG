// modules/valombreuse5egmg/apps/secret-sheet.js
// Migration AppV2 — conserve l’héritage D&D5e et remplace les listeners jQuery.

export class ValombreuseSecretSheet extends dnd5e.applications.item.ItemSheet5e {
  /** -------- Options AppV2 -------- */
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    // Pas besoin de tag:"form" ici : ItemSheet5e gère déjà le formulaire.
    window: {
      // (optionnel) tu peux ajouter des boutons de header via controls si besoin
      controls: []
    }
  });

 /** @override */
  static PARTS = {
    header: {
      template: "modules/Valombreuse5eGMG/templates/secret-sheet.hbs"
    },
    tabs: {
      template: "systems/dnd5e/templates/shared/horizontal-tabs.hbs",
      templates: ["templates/generic/tab-navigation.hbs"]
    },
    description: {
      template: "systems/dnd5e/templates/items/description.hbs",
      scrollable: [""]
    },
    details: {
      template: "systems/dnd5e/templates/items/details.hbs",
      scrollable: [""]
    }
  };

  /* -------------------------------------------- */

  /** @override */
  static TABS = [
    { tab: "description", label: "DND5E.ITEM.SECTIONS.Description" },
    { tab: "details", label: "DND5E.ITEM.SECTIONS.Details", condition: this.isItemIdentified.bind(this) }
  ];

  /* -------------------------------------------- */

  /** @override */
  tabGroups = {
    primary: "description"
  };

  /**
   * AppV2: on ajoute/retire nos listeners DOM dans _onRender (plus de jQuery implicite).
   * @param {ApplicationRenderContext} context
   * @param {object} options
   */
  async _onRender(context, options) {
    await super._onRender(context, options);

    // Racine de la feuille
    const root = this.element;
    if (!root) return;

    // --- CHANGE du type de Secret (select) ---
    const typeSelect = root.querySelector('select[name="system.type.subtype"]');
    if (typeSelect) {
      typeSelect.removeEventListener("change", this.#onChangeSecretTypeBound);
      this.#onChangeSecretTypeBound = this.#onChangeSecretTypeBound ?? (ev => this.#onChangeSecretType(ev));
      typeSelect.addEventListener("change", this.#onChangeSecretTypeBound, { passive: false });
    }

    // --- CHANGE du niveau de secret (input.number .secret-level) ---
    root.querySelectorAll(".secret-level").forEach(input => {
      input.removeEventListener("change", this.#onChangeSecretLevelBound);
      this.#onChangeSecretLevelBound = this.#onChangeSecretLevelBound ?? (ev => this.#onChangeSecretLevel(ev));
      input.addEventListener("change", this.#onChangeSecretLevelBound, { passive: false });
    });
  }

  // Bind holders (pour pouvoir removeEventListener proprement)
  #onChangeSecretTypeBound;
  #onChangeSecretLevelBound;

  /** Change de type => met à jour l’icône + le sous-type sur l’item. */
  async #onChangeSecretType(event) {
    event.preventDefault();
    const value = event.currentTarget?.value;
    if (!value) return;

    const imgByType = {
      secretworld:   "modules/Valombreuse5eGMG/assets/icons/World-secret.webp",
      secretbloodline:"modules/Valombreuse5eGMG/assets/icons/Bloodline-secret.webp",
      secretorder:   "modules/Valombreuse5eGMG/assets/icons/Order-secret.webp",
      secretgenesis: "modules/Valombreuse5eGMG/assets/icons/Genesis-secret.webp"
    };

    const updateData = {
      "system.type.subtype": value,
      img: imgByType[value] ?? "icons/svg/item-bag.svg"
    };

    try {
      await this.item.update(updateData);
    } catch (err) {
      console.error("Valombreuse Secret: subtype update failed", err);
      ui.notifications?.error(game.i18n.localize("Error"));
    }
  }

  /** Change du niveau (quantity) via .secret-level */
  async #onChangeSecretLevel(event) {
    event.preventDefault();
    const input = event.currentTarget;
    const value = Number(input?.value ?? 0);
    try {
      await this.item.update({ "system.quantity": value });
    } catch (err) {
      console.error("Valombreuse Secret: level update failed", err);
      ui.notifications?.error(game.i18n.localize("Error"));
    }
  }

  /** 
   * (Optionnel) Si tu préfères un fallback simple au lieu de PARTS,
   * tu peux garder ce getter — ItemSheet5e V2 l’ignore si PARTS est présent.
   */
  get template() {
    // Ne renvoyer ton template que pour le type concerné.
    // Tu utilisais "loot" pour tes Secrets : on conserve ce comportement.
    if (this.item.type === "loot") {
      return "modules/Valombreuse5eGMG/templates/secret-sheet.hbs";
    }
    // Sinon, délègue au template du système pour autres types.
    return `systems/dnd5e/templates/items/${this.item.type}.hbs`;
  }
}