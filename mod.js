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
        mydb = await importerUtil.loadRecursiveAsync(`${modLoader.getModPath("CNN-Containers")}database/`);

        // Load items into the game's item templates
        for (const item in mydb.templates.items) {
            items[item] = mydb.templates.items[item]; // Add each custom item to the game's database
        }

        // Add items to the handbook
        for (const item of mydb.templates.handbook.Items) {
            handbook.push(item); // Append each custom handbook entry
        }

        // Load item presets from mod database
        for (const preset in mydb.globals.ItemPresets) {
            db.globals.ItemPresets[preset] = mydb.globals.ItemPresets[preset];
        }

        // Update each trader's assort, barters, and loyalty levels
        for (const trader in mydb.traders) {

            // Add each item into trader's item list
            for (const item of mydb.traders[trader].assort.assorts.items) {
                db.traders[trader].assort.items.push(item);
            }

            // Update barters for each item
            for (const bc in mydb.traders[trader].assort.assorts.barter_scheme) {
                db.traders[trader].assort.barter_scheme[bc] = mydb.traders[trader].assort.assorts.barter_scheme[bc];
            }

            // Set loyalty level requirements for items
            for (const level in mydb.traders[trader].assort.assorts.loyal_level_items) {
                db.traders[trader].assort.loyal_level_items[level] = mydb.traders[trader].assort.assorts.loyal_level_items[level];
            }
        }

        // Update localization files
        for (const localeID in locales) {
            // Iterate through each item and template pair in the mod's English localization
            for (const [itemId, template] of Object.entries(mydb.locales.en.templates)) {
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
