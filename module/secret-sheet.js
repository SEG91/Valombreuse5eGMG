


export class ValombreuseSecretSheet extends dnd5e.applications.item.ItemSheet5e {

  



    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        if (!this.options.editable) return;
       html.on('change', 'select[name="system.type.subtype"]', async (ev) => {
    ev.preventDefault();
    const value = ev.currentTarget.value;
    console.log('Secret type changed:', value);
    let item=this.item;

    switch(value){
    case "secretworld":
      {
       this.item.update({  "img": "modules/Valombreuse5eGMG/assets/icons/World-secret.webp" }); 
       this.item.update({  "system.type.subtype": "secretworld" });
       break;
      }
    case "secretbloodline":
       {
       this.item.update({  "img": "modules/Valombreuse5eGMG/assets/icons/Bloodline-secret.webp" });
       this.item.update({  "system.type.subtype": "secretbloodline" });
       break;
      }
       this.item.update({  "system.type.subtype": "secretorder" });
    case "secretorder":
       {
       this.item.update({  "img": "modules/Valombreuse5eGMG/assets/icons/Order-secret.webp" });
       this.item.update({  "system.type.subtype": "secretorder" });
       break;
      }
      case "secretgenesis":
         {
        this.item.update({  "img": "modules/Valombreuse5eGMG/assets/icons/Genesis-secret.webp" });
       this.item.update({  "system.type.subtype": "secretgenesis" });
       break;
      }
    default:
      this.item.img="icons/svg/item-bag.svg";
    }
  });

 html.on('change', '.secret-level', async (ev) => {
            ev.preventDefault();
            const input = ev.currentTarget;
            const value = ev.currentTarget.value;

    
            return this.item.update({"system.quantity":value});
     });

    }
 /** @override */
    get template() {
      const itype=this.item.type;
      if (itype === 'loot') {
        return `modules/valombreuse5egmg/templates/secret-sheet.hbs`;
      }
      else
        return `systems/dnd5e/templates/items/${this.item.type}.hbs`;
    }
    
}
