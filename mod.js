"use strict";

// Variable to hold custom database data
let mydb;

class Mod {
    // This asynchronous method loads custom data into the game's database after the base DB load completes
    async postDBLoadAsync(container) {
        // Retrieve the database object and various utilities
        const db = container.resolve("DatabaseServer").getTables();
        const modLoader = container.resolve("PreSptModLoader");
        const importerUtil = container.resolve("ImporterUtil");
        const locales = db.locales.global;
        const items = db.templates.items;
        const handbook = db.templates.handbook.Items;

        // Load database data from the mod's database folder asynchronously
        mydb = await importerUtil.loadAsync(`${modLoader.getModPath("CNN-Containers")}database/`);

        // Load items into the game's item templates
        for (const item in await mydb.templates.items) {
            items[item] = await mydb.templates.items[item]; // Add each custom item to the game's database
        }

        // Add items to the handbook
        for (const item of await mydb.templates.handbook.Items) {
            handbook.push(item); // Append each custom handbook entry
        }

        // Load item presets from mod database
        for (const preset in await mydb.globals.ItemPresets) {
            db.globals.ItemPresets[preset] = await mydb.globals.ItemPresets[preset];
        }

        // Get all secure containers
        const secureContainerIDs = Object.keys(items).filter(id => 
            items[id]._props?.CantRemoveFromSlotsDuringRaid?.includes("SecuredContainer")
        );

        let isAdded = false;

        for (const containerId of secureContainerIDs) {
            const container = items[containerId];

            for (const grid of container._props.Grids) {
                for (const filterObj of grid._props.filters) {
                    for (const newItemId in await mydb.templates.items) {
                        newItemId
                        //console.log(`Adding ${newItemId} to container ${containerId}:`);
                        // Avoid duplicates
                        if (!filterObj.Filter.includes(newItemId)) {
                            filterObj.Filter.push(newItemId);
                            if (filterObj.Filter.includes(newItemId)) {
                                isAdded = true;
                            }
                        }
                    }
                }
            }
            //console.log(`Added to container ${containerId}:`, isAdded);
        }
        

        // Update each trader's assort, barters, and loyalty levels
        for (const trader in await mydb.traders) {

            // Add each item into trader's item list
            for (const item of await mydb.traders[trader].assort.assorts.items) {
                db.traders[trader].assort.items.push(item);
            }

            // Update barters for each item
            for (const bc in await mydb.traders[trader].assort.assorts.barter_scheme) {
                db.traders[trader].assort.barter_scheme[bc] = await mydb.traders[trader].assort.assorts.barter_scheme[bc];
            }

            // Set loyalty level requirements for items
            for (const level in await mydb.traders[trader].assort.assorts.loyal_level_items) {
                db.traders[trader].assort.loyal_level_items[level] = await mydb.traders[trader].assort.assorts.loyal_level_items[level];
            }
        }

        // Update localization files
        for (const localeID in locales) {
            // Iterate through each item and template pair in the mod's English localization
            for (const [itemId, template] of Object.entries(await mydb.locales.en.templates)) {
                for (const [key, value] of Object.entries(template)) {
                    // Add each key-value pair for localized strings (e.g., name, description)
                    locales[localeID][`${itemId} ${key}`] = value;
                }
            }
        }
    }
}

// Export the mod class
module.exports = { mod: new Mod() };
