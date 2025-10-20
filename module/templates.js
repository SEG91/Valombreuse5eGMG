/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "modules/valombreuse5egmg/templates/vein-sheet.hbs",
        "modules/valombreuse5egmg/templates/vein-sheetv2.hbs",
        "modules/valombreuse5egmg/templates/vein-header.hbs",
        "modules/valombreuse5egmg/templates/vein-members.hbs",
        "modules/valombreuse5egmg/templates/vein-diplomacy.hbs",
        "modules/valombreuse5egmg/templates/secret-sheet.hbs",
        "modules/valombreuse5egmg/templates/vein-secret.hbs",
        "modules/valombreuse5egmg/templates/vein-powers.hbs",
        "modules/valombreuse5egmg/templates/vein-powers-row.hbs",
        "modules/valombreuse5egmg/templates/odyssey-entry.hbs",
        "modules/valombreuse5egmg/templates/vein-odyssey-timeline.hbs"
        ];

    // Load the template parts
    return foundry.applications.handlebars.loadTemplates(templatePaths);
};
