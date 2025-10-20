/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        // ACTOR
        "modules/Valombreuse5eGMG/templates/vein-sheet.hbs",
        "modules/Valombreuse5eGMG/templates/vein-sheetv2.hbs",
        "modules/Valombreuse5eGMG/templates/vein-header.hbs",
        "modules/Valombreuse5eGMG/templates/vein-members.hbs",
        "modules/Valombreuse5eGMG/templates/vein-diplomacy.hbs",
        "modules/Valombreuse5eGMG/templates/secret-sheet.hbs",
        "modules/Valombreuse5eGMG/templates/vein-secret.hbs",
        "modules/Valombreuse5eGMG/templates/vein-powers.hbs",
        "modules/Valombreuse5eGMG/templates/vein-powers-row.hbs",
        "modules/Valombreuse5eGMG/templates/odyssey-entry.hbs",
        "modules/Valombreuse5eGMG/templates/vein-odyssey-timeline.hbs"
        ];

    // Load the template parts
    return foundry.applications.handlebars.loadTemplates(templatePaths);
};
