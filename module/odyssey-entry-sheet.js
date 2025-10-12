const MOD_ID = "Valombreuse5eGMG";
//foundry.applications.sheets.journal.JournalEntrySheet
export class OdysseyEntrySheet extends foundry.appv1.sheets.JournalSheet {
  /*static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: [...super.defaultOptions.classes, "odyssey"],
    });
  }*/

    static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sheet", "journal-sheet", "Valombreuse5eGMG", "odyssey"],
      width: 1000,
      height: 700,
      resizable: true,
      minimizable: true,
    });
  }

  get template() {
    return "modules/valombreuse5egmg/templates/odyssey-entry.hbs";
  }

  async getData(options = {}) {
    const data = await super.getData(options);

    // Flags "odyssey"
    const f = this.object.getFlag(MOD_ID, "odyssey") || {};
    data.odyssey = {
      header: {
        date:   f?.header?.date   ?? "",
        region: f?.header?.region ?? "",
        gm:     f?.header?.gm     ?? "",
        bg:     f?.header?.bg     ?? ""
      },
      summary:  f?.summary  ?? "",
      decisions: Array.isArray(f?.decisions) ? f.decisions : [],
      secrets:   Array.isArray(f?.secrets)   ? f.secrets   : [],
      rewards:   Array.isArray(f?.rewards)   ? f.rewards   : [],
      gmnotes: f?.gmnotes ?? "",
      excerpt: f?.excerpt ?? ""
    };

    // Image de fond
    const fallbackImg = this.object.thumb ?? this.object.img ?? "";
    data.bgURL = data.odyssey.header.bg || fallbackImg;

    // Editabilité
    data.editable = this.isEditable;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    const $html = html instanceof jQuery ? html : $(html);

    // AUTOSAVE des champs simples (avec "name")
    $html.on("change blur keydown", "[data-autosave]", async (ev) => {
      if (ev.type === "keydown" && ev.key !== "Enter") return;
      await this._saveWholeForm();
    });

    // AUTOSAVE des blocs dynamiques : textarea sans "name", mais avec data-target + data-index
    const saveBlock = async (ta) => {
      const target = ta.dataset.target;
      const idxStr = ta.dataset.index;
      if (!target || idxStr == null) return;
      const idx = Number(idxStr);
      const val = ta.value ?? "";

      const f = this.object.getFlag(MOD_ID, "odyssey") || {};
      const arr = Array.isArray(f[target]) ? [...f[target]] : [];
      // étend le tableau si nécessaire
      while (arr.length <= idx) arr.push("");
      arr[idx] = val;

      await this.object.setFlag(MOD_ID, `odyssey.${target}`, arr);
    };

    // Sauvegarder à la sortie du champ, sur changement, et sur Enter
    $html.on("blur change", ".od-block__textarea", async (ev) => {
      await saveBlock(ev.currentTarget);
    });
    $html.on("keydown", ".od-block__textarea", async (ev) => {
      if (ev.key === "Enter" && !ev.shiftKey) {
        ev.preventDefault();
        await saveBlock(ev.currentTarget);
        ev.currentTarget.blur();
      }
    });

    // Ajouter un nouveau bloc vide dans la section ciblée
    $html.on("click", "[data-action='addBlock']", async (ev) => {
      ev.preventDefault();
      const target = ev.currentTarget.dataset.target;
      if (!target) return;

      const f = this.object.getFlag(MOD_ID, "odyssey") || {};
      const arr = Array.isArray(f[target]) ? [...f[target]] : [];
      arr.push("");

      await this.object.setFlag(MOD_ID, `odyssey.${target}`, arr);

      // Re-render puis focus dernier
      this.render(false);
      Hooks.once("renderJournalSheet", (app, root) => {
        const scope = root instanceof jQuery ? root[0] : root;
        const list = scope?.querySelector(`.od-blocklist[data-target="${target}"]`);
        const last = list?.querySelector("textarea.od-block__textarea:last-of-type");
        if (last) last.focus();
      });
    });
  }

  /** Sauvegarde complète du formulaire pour les champs simples */
  async _saveWholeForm() {
    if (!this.form) return;
    const formData = new FormData(this.form);
    const obj = {};
    for (const [k, v] of formData.entries()) obj[k] = v;
    const expanded = foundry.utils.expandObject(obj);
    await this.object.update(expanded);
  }

}
