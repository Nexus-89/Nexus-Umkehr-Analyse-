
export enum Muster {
  Projektion = "Projektion",
  Rueckgriff = "Rückgriff",
  Relativierung = "Relativierung",
  Schuldabwehr = "Schuldabwehr",
  Keins = "-",
}

export enum Emotionalitaet {
  Hoch = "Hoch",
  Mittel = "Mittel",
  Niedrig = "Niedrig",
}

export enum Kontext {
  Konflikt = "Konflikt",
  Feedback = "Feedback",
  Planung = "Planung",
  Allgemein = "Allgemein",
}

export type VerantwortungUebernommen = "Ja" | "Nein";

export interface GespraechsEintrag {
  gespraechsId: string;
  sprecher: string;
  text: string;
  kontext: Kontext;
  muster: Muster;
  verantwortungUebernommen: VerantwortungUebernommen;
  emotionalitaet: Emotionalitaet;
  datum: string; // ISO 8601 format
}

export interface BerechneterGespraechsEintrag extends GespraechsEintrag {
  veraenderungsChance: number;
}
