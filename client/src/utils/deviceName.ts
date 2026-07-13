const ADJECTIVES = [
  'Swift',
  'Sunny',
  'Brave',
  'Calm',
  'Clever',
  'Cosmic',
  'Crisp',
  'Daring',
  'Gentle',
  'Golden',
  'Happy',
  'Lucky',
  'Mellow',
  'Nimble',
  'Quiet',
  'Rapid',
  'Shiny',
  'Silver',
  'Smooth',
  'Spry',
  'Stellar',
  'Velvet',
  'Vivid',
  'Zesty',
];

const ANIMALS = [
  'Falcon',
  'Otter',
  'Lynx',
  'Panda',
  'Fox',
  'Heron',
  'Ibex',
  'Jaguar',
  'Koala',
  'Lemur',
  'Marten',
  'Narwhal',
  'Ocelot',
  'Puffin',
  'Quokka',
  'Raven',
  'Seal',
  'Tiger',
  'Urchin',
  'Vole',
  'Walrus',
  'Yak',
  'Zebra',
  'Dolphin',
];

function pick<T>(list: readonly T[]): T {
  const index = Math.floor(Math.random() * list.length);
  // Non-null: index is always within bounds.
  return list[index] as T;
}

/** Generates a friendly two-word device name, e.g. "Swift Falcon". */
export function generateDeviceName(): string {
  return `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
}
