import { WheelConfig } from "./config-base";

// Duos - Activities good for 2 players
export const duosConfig: WheelConfig = {
  spinDuration: 6000,
  spinVariance: 4000,
  items: [
    // Raids (can be done duo)
    { name: "Chambers of Xeric", weight: 2, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Chambers_of_Xeric_logo.png/500px-Chambers_of_Xeric_logo.png?34a98", wikiUrl: "https://oldschool.runescape.wiki/w/Chambers_of_Xeric" },
    { name: "Tombs of Amascut", weight: 2, imageUrl: "https://oldschool.runescape.wiki/images/Tombs_of_Amascut.png", wikiUrl: "https://oldschool.runescape.wiki/w/Tombs_of_Amascut" },

    // Duo bosses
    { name: "Nex", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/Nex.png", wikiUrl: "https://oldschool.runescape.wiki/w/Nex" },
    { name: "The Nightmare", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/The_Nightmare.png", wikiUrl: "https://oldschool.runescape.wiki/w/The_Nightmare" },

    // Wilderness bosses (duo for safety)
    { name: "Callisto", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Callisto.png", wikiUrl: "https://oldschool.runescape.wiki/w/Callisto" },
    { name: "Venenatis", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Venenatis.png", wikiUrl: "https://oldschool.runescape.wiki/w/Venenatis" },
    { name: "Vet'ion", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Vet%27ion.png", wikiUrl: "https://oldschool.runescape.wiki/w/Vet%27ion" },

    // Other duo-friendly content
    { name: "The Hueycoatl", weight: 2, imageUrl: "https://oldschool.runescape.wiki/images/The_Hueycoatl.png", wikiUrl: "https://oldschool.runescape.wiki/w/The_Hueycoatl" },
    { name: "Scurrius", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/Scurrius.png", wikiUrl: "https://oldschool.runescape.wiki/w/Scurrius" },

    // Actual duo bosses
    { name: "Yama", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Yama.png/310px-Yama.png", wikiUrl: "https://oldschool.runescape.wiki/w/Yama" },
    { name: "Titans", weight: 5, imageUrl: [
      "https://oldschool.runescape.wiki/images/thumb/Eldric_the_Ice_King.png/196px-Eldric_the_Ice_King.png",
      "https://oldschool.runescape.wiki/images/thumb/Branda_the_Fire_Queen.png/188px-Branda_the_Fire_Queen.png?0687c",
    ], wikiUrl: "https://oldschool.runescape.wiki/w/Royal_Titans" },
  ]
};
