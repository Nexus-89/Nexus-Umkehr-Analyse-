
import { GespraechsEintrag, Emotionalitaet, Muster } from '../types';

export const calculateVeraenderungsChance = (eintrag: GespraechsEintrag): number => {
  let chance = 50;

  chance += eintrag.verantwortungUebernommen === "Ja" ? 20 : 0;
  chance -= eintrag.muster !== Muster.Keins ? 15 : 0;

  switch (eintrag.emotionalitaet) {
    case Emotionalitaet.Hoch:
      chance -= 10;
      break;
    case Emotionalitaet.Mittel:
      chance -= 5; // 10 * 0.5
      break;
    case Emotionalitaet.Niedrig:
      chance -= 0;
      break;
  }

  // Begrenzen auf 0-100
  return Math.max(0, Math.min(100, chance));
};
