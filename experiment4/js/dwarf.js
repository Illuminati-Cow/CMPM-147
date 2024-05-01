"use strict"
class Dwarf {
    static dwarfNames = require('./dwarfNames.json');
    static clanKnowledge = {};
    constructor(x, y, clan) {
        this.name = dwarfNames[Math.floor(Math.random() * dwarfNames.length)];
        this.clan = clan;
        if (!clanKnowledge[clan]) {
            clanKnowledge[clan] = {};
        }
        this.knowledge = clanKnowledge[clan];
    };

    
}