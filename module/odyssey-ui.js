const MOD_ID = "Valombreuse5eGMG";
const BTN_CLASS = "ve-create-odyssey";

/**
 * Opens a simple Foundry Dialog asking the user for a name.
 * @param {string} typeLabel - Used in the title (e.g. "Odyssey", "Entry").
 * @returns {Promise<string|null>} - The name entered by the user, or null if canceled.
 */
export async function promptForName(typeLabel = "Entry") {
  return new Promise((resolve) => {
    const title = `${game.i18n.localize("Valombreuse5eGMG.CreateOdyssey") || "Create Odyssey"} ${typeLabel}`;
    const nameLabel = game.i18n.localize("Valombreuse5eGMG.OdysseyName") || "Name";

    const content = `
      <form>
        <div class="form-group">
          <label>${nameLabel}</label>
          <input type="text" name="entry-name" value="${typeLabel}" autofocus />
        </div>
      </form>
    `;

    new Dialog({
      title,
      content,
      buttons: {
        ok: {
          label: game.i18n.localize("OK") || "OK",
          callback: (html) => {
            const input = html[0].querySelector('input[name="entry-name"]');
            const name = input?.value?.trim();
            resolve(name || null);
          }
        },
        cancel: {
          label: game.i18n.localize("Cancel") || "Cancel",
          callback: () => resolve(null)
        }
      },
      default: "ok",
      close: () => resolve(null)
    }).render(true);
  });
}


/**
 * Adds a "Create Odyssey" button in the Journal Directory header.
 */
export function installOdysseyJournalButton() {
  Hooks.on("renderJournalDirectory", (app, html) => {
    const root = html[0] ?? html;
    const actions = root.querySelector(".header-actions, .action-buttons");
    if (!actions || actions.querySelector(`.${BTN_CLASS}`)) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = BTN_CLASS;
    btn.innerHTML = `<i class="fa-solid fa-compass"></i> ${game.i18n.localize("Valombreuse5eGMG.CreateOdyssey") || "Create Odyssey"}`;

    btn.addEventListener("click", async () => {
      const name = await promptForName("Odyssey");
      if (name) {
        const doc = await game.odysseymanager?.createOdysseyJournal?.(name);
        if (doc) doc.sheet?.render(true);
      }
    });

    actions.appendChild(btn);
  });
}
