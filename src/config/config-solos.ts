import { WheelConfig } from "./config-base";

// Solo activities - Bosses designed for solo play
export const solosConfig: WheelConfig = {
  spinDuration: 6000,
  spinVariance: 4000,
  items: [
    // DT2 Bosses
    { name: "Duke Sucellus", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Duke_Sucellus.png", wikiUrl: "https://oldschool.runescape.wiki/w/Duke_Sucellus" },
    { name: "The Leviathan", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/The_Leviathan.png", wikiUrl: "https://oldschool.runescape.wiki/w/The_Leviathan" },
    { name: "The Whisperer", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/The_Whisperer.png", wikiUrl: "https://oldschool.runescape.wiki/w/The_Whisperer" },
    { name: "Vardorvis", weight: 3, imageUrl: "https://oldschool.runescape.wiki/images/Vardorvis.png", wikiUrl: "https://oldschool.runescape.wiki/w/Vardorvis" },

    { name: "Giant Mole", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Giant_Mole.png/300px-Giant_Mole.png", wikiUrl: "https://oldschool.runescape.wiki/w/Giant_Mole" },
    { name: "Barrows", weight: 1, imageUrl: [
      "https://oldschool.runescape.wiki/images/thumb/Verac_the_Defiled.png/126px-Verac_the_Defiled.png",
      "https://oldschool.runescape.wiki/images/thumb/Guthan_the_Infested.png/93px-Guthan_the_Infested.png?33092",
      "https://oldschool.runescape.wiki/images/thumb/Torag_the_Corrupted.png/145px-Torag_the_Corrupted.png?33092",
      "https://oldschool.runescape.wiki/images/thumb/Dharok_the_Wretched.png/114px-Dharok_the_Wretched.png?33092",
      "https://oldschool.runescape.wiki/images/thumb/Karil_the_Tainted.png/169px-Karil_the_Tainted.png?33092",
      "https://oldschool.runescape.wiki/images/thumb/Ahrim_the_Blighted.png/113px-Ahrim_the_Blighted.png?33092",
    ], wikiUrl: "https://oldschool.runescape.wiki/w/Barrows"
    },

    { name: "Moons of Peril", weight: 1, imageUrl: [
      "https://oldschool.runescape.wiki/images/thumb/Blood_Moon.png/162px-Blood_Moon.png?c3e72",
      "https://oldschool.runescape.wiki/images/thumb/Eclipse_Moon.png/162px-Eclipse_Moon.png?c3e72",
      "https://oldschool.runescape.wiki/images/thumb/Blue_Moon.png/174px-Blue_Moon.png?c3e72"
    ], wikiUrl: "https://oldschool.runescape.wiki/w/Moons_of_Peril"
    },

    { name: "God Wars", weight: 1, imageUrl: [
      "https://oldschool.runescape.wiki/images/thumb/Kree%27arra.png/282px-Kree%27arra.png?ba75c",
      "https://oldschool.runescape.wiki/images/thumb/General_Graardor.png/250px-General_Graardor.png?4dd90",
      "https://oldschool.runescape.wiki/images/thumb/K%27ril_Tsutsaroth.png/275px-K%27ril_Tsutsaroth.png?73bda",
      "https://oldschool.runescape.wiki/images/thumb/Commander_Zilyana.png/177px-Commander_Zilyana.png?c5eaa"
    ], wikiUrl: "https://oldschool.runescape.wiki/w/God_Wars_Dungeon"
    },
    { name: "General Graardor", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/General_Graardor.png", wikiUrl: "https://oldschool.runescape.wiki/w/General_Graardor" },
    { name: "Commander Zilyana", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/Commander_Zilyana.png", wikiUrl: "https://oldschool.runescape.wiki/w/Commander_Zilyana" },
    { name: "Kree'arra", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/Kree%27arra.png", wikiUrl: "https://oldschool.runescape.wiki/w/Kree%27arra" },
    { name: "K'ril Tsutsaroth", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/K%27ril_Tsutsaroth.png", wikiUrl: "https://oldschool.runescape.wiki/w/K%27ril_Tsutsaroth" },

    { name: "Doom of Mokhaiotl", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Doom_of_Mokhaiotl.png/300px-Doom_of_Mokhaiotl.png?e5edb", wikiUrl: "https://oldschool.runescape.wiki/w/Doom_of_Mokhaiotl" },
    { name: "Zulrah", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Zulrah_%28serpentine%29.png/280px-Zulrah_%28serpentine%29.png?29a54", wikiUrl: "https://oldschool.runescape.wiki/w/Zulrah" },
    { name: "Vorkath", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Vorkath.png/380px-Vorkath.png?1ce3f", wikiUrl: "https://oldschool.runescape.wiki/w/Vorkath" },
    { name: "Muspah", weight: 1, imageUrl: "https://oldschool.runescape.wiki/images/thumb/Phantom_Muspah_%28ranged%29.png/298px-Phantom_Muspah_%28ranged%29.png?9cf6a", wikiUrl: "https://oldschool.runescape.wiki/w/Phantom_Muspah" },


  ]
};
