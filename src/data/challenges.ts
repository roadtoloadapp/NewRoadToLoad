export interface ChallengeItem {
  id: string;
  hu: string;
  en: string;
  category: 'social' | 'drink' | 'fun' | 'action';
}

export const CHALLENGES: ChallengeItem[] = [
  {
    id: 'c1',
    hu: 'Igyatok egy kört a pultos legkedvencebb feleséből vagy a ház ajánlatából!',
    en: 'Drink a round of the bartender’s personal favorite shot or house specialty!',
    category: 'drink'
  },
  {
    id: 'c2',
    hu: 'Kérdezzétek meg a pultostól: mi a hely legfurcsább vagy legviccesebb törzsvendég-sztorija?',
    en: 'Ask the bartender: what is the weirdest or funniest regular customer story here?',
    category: 'social'
  },
  {
    id: 'c3',
    hu: 'Aki utoljára lépi át a kocsma küszöbét, az rendeli a következő kört!',
    en: 'The last person in the group to step inside orders the next round!',
    category: 'fun'
  },
  {
    id: 'c4',
    hu: 'Tanítsatok meg egy külföldi asztaltársaságnak egy vicces magyar szót (pl. "Egészségedre!" vagy "Koccintás")!',
    en: 'Teach a traveler or neighboring table a cool Hungarian word (e.g. "Egészségedre" - Cheers)!',
    category: 'social'
  },
  {
    id: 'c5',
    hu: 'Készítsetek egy közös csapat szelfit a kocsma legbizarrabb fali dekorációjával!',
    en: 'Take a group selfie with the weirdest wall decoration or artifact you can find!',
    category: 'action'
  },
  {
    id: 'c6',
    hu: 'Koccintsatok egy olyan emberrel a pultnál, akit ma láttok életetekben először!',
    en: 'Clink glasses and say cheers with someone at the bar you have never met before!',
    category: 'social'
  },
  {
    id: 'c7',
    hu: 'Rendeljetek egy italt a pultnál kizárólag pantomimmal/kézjelekkel, hang nélkül!',
    en: 'Order your drink at the bar using only hand gestures and pantomime, without speaking!',
    category: 'action'
  },
  {
    id: 'c8',
    hu: 'Találjatok ki egy új, titkos koktélnevet a mai estére és kérdezzétek meg, el tudják-e készíteni!',
    en: 'Invent a secret cocktail name for tonight and ask the bartender if they can brew it!',
    category: 'fun'
  },
  {
    id: 'c9',
    hu: 'Dobjatok kő-papír-ollót: a vesztesnek kell elmondania a legpatetikusabb filmes pohárköszöntőt!',
    en: 'Play Rock-Paper-Scissors: the loser must deliver an epic Hollywood movie toast!',
    category: 'fun'
  },
  {
    id: 'c10',
    hu: 'Mindenki kizárólag a nem domináns (pl. bal) kezével foghatja a poharát ennél az állomásnál!',
    en: 'Everyone must hold and drink from their glass using only their non-dominant hand here!',
    category: 'action'
  },
  {
    id: 'c11',
    hu: 'Kérjetek a pultostól egy söralátétet, és rajzoljátok le egymás portréját rá 60 másodperc alatt!',
    en: 'Get a coaster from the bar and speed-draw each other’s caricature in under 60 seconds!',
    category: 'fun'
  },
  {
    id: 'c12',
    hu: 'Kóstoljatok meg egy olyan magyar italt, amit eddig még sosem ittál (pl. Unicum Szilva, kézműves meggyes sör vagy traubisoda fröccs)!',
    en: 'Taste an authentic Hungarian specialty drink you’ve never tried before (Unicum, artisanal beer, or wine spritzer)!',
    category: 'drink'
  },
  {
    id: 'c13',
    hu: 'Találjátok meg a kocsma legrejtettebb szegletét és hagyjatok egy titkos üzenetet vagy matricát!',
    en: 'Find the most hidden corner or underground alcove of the bar and take a photo of it!',
    category: 'action'
  },
  {
    id: 'c14',
    hu: 'Mondjatok egymásnak egy-egy igaz és egy hamis történetet egy korábbi görbe estétekről – a többieknek ki kell találniuk!',
    en: 'Two truths and a lie: tell crazy nightlife stories and let your friends guess the lie!',
    category: 'social'
  },
  {
    id: 'c15',
    hu: 'Csináljatok egy 10 másodperces lassított felvételes videót (slow-mo) a koccintásotokról!',
    en: 'Shoot a stylish 10-second slow-motion video of your synchronized team toast!',
    category: 'action'
  }
];

export function getRandomChallenge(lang: 'hu' | 'en'): { hu: string; en: string } {
  const item = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
  return { hu: item.hu, en: item.en };
}
