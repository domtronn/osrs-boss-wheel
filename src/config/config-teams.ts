import { WheelConfig } from "./config-base";

// Teams activities - Raids and group bosses
export const teamsConfig: WheelConfig = {
  spinDuration: 6000,
  spinVariance: 4000,
  items: [
    // Raids
    { name: "Chambers of Xeric", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Chambers_of_Xeric_logo.png/500px-Chambers_of_Xeric_logo.png?34a98", wikiUrl: "https://oldschool.runescape.wiki/w/Chambers_of_Xeric" },
    { name: "Theatre of Blood", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Theatre_of_Blood_logo.png/500px-Theatre_of_Blood_logo.png?e6e68", wikiUrl: "https://oldschool.runescape.wiki/w/Theatre_of_Blood" },
    { name: "Tombs of Amascut", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Tombs_of_Amascut.png", wikiUrl: "https://oldschool.runescape.wiki/w/Tombs_of_Amascut" },

    // Group bosses
    { name: "Nex", weight: 2, imageUrl: "https://oldschool.runescape.wiki/images/Nex.png", wikiUrl: "https://oldschool.runescape.wiki/w/Nex" },
    { name: "The Nightmare", weight: 2, imageUrl: "https://oldschool.runescape.wiki/images/The_Nightmare.png", wikiUrl: "https://oldschool.runescape.wiki/w/The_Nightmare" },

    // Wilderness bosses (duo for safety)
    { name: "Callisto", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Callisto.png", wikiUrl: "https://oldschool.runescape.wiki/w/Callisto" },
    { name: "Venenatis", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Venenatis.png", wikiUrl: "https://oldschool.runescape.wiki/w/Venenatis" },
    { name: "Vet'ion", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Vet%27ion.png", wikiUrl: "https://oldschool.runescape.wiki/w/Vet%27ion" },
    { name: "Revs", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Revenant_maledictus.png/291px-Revenant_maledictus.png?73c48", wikiUrl: "https://oldschool.runescape.wiki/w/Revenant_Caves" },

    // Minigame
    { name: "Barbarian Assault", weight: 2, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Penance_Queen.png/580px-Penance_Queen.png", wikiUrl: "https://oldschool.runescape.wiki/w/Barbarian_Assault" },

    { name: "The Hueycoatl", weight: 2, imageUrl: "https://oldschool.runescape.wiki/images/The_Hueycoatl.png", wikiUrl: "https://oldschool.runescape.wiki/w/The_Hueycoatl" },
    { name: "Scurrius", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/Scurrius.png", wikiUrl: "https://oldschool.runescape.wiki/w/Scurrius" },
  ]
};
