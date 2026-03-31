/**
 * lib/constants.js
 * All static data, config values, and magic strings.
 * Centralised here so they're easy to change without hunting the codebase.
 */

export const PAGES = ['generate', 'gallery', 'forge', 'profile'];

export const MODELS = ['FLUX.1 Pro', 'SDXL Lightning', 'Stable Diffusion 3', 'Midjourney v6 (sim)'];

export const STYLES = ['Aucun', 'Anime', 'Réaliste', 'Fantasy', 'Cyber', 'Sketch'];

export const QUICK_TAGS = [
  'cinematic', '8k ultra detailed', 'neon lights',
  'anime style', 'photorealistic', 'dark fantasy', 'cyberpunk',
];

/** Rotating messages shown during image generation */
export const LOADING_MESSAGES = [
  'Initialisation du modèle...',
  'Analyse du prompt...',
  'Génération des tokens...',
  'Diffusion en cours...',
  'Affinement des détails...',
  'Post-traitement...',
  'Finalisation...',
];

/** Bank of random prompts for the "Random" button */
export const RANDOM_PROMPTS = [
  'Guerrier cyberpunk sous la pluie néon, 8k ultra detailed, cinematic lighting',
  'Dragonne de cristal dans une forêt enchantée magique, style fantasy, volumetric fog',
  'Astronaute solitaire sur Mars au golden hour, photorealistic, cinematic',
  'Géisha futuriste entourée de lumières holographiques, anime style, ultra detailed',
  'Ville steampunk flottante au coucher de soleil, dramatic sky, concept art',
  'Portrait alien bioluminescent, fond sombre, studio lighting, 4k',
  'Forêt de bambou éthérée au lever du soleil, brume matinale, photorealistic',
  'Robot victorien servant du thé dans un salon baroque, sepia tones',
  'Mage des glaces invoquant un blizzard, epic fantasy, particle effects',
  'Mer de nuages violets avec des îles flottantes, surrealistic, dreamlike',
  'Chat samouraï en armure de jade, illustration japandi, ink painting style',
  'Bibliothèque infinie interstellaire, sci-fi baroque, golden light shafts',
];

/** Prompt improvement suffixes for the "Améliorer" button */
export const IMPROVEMENT_SUFFIXES = [
  ', masterpiece, ultra detailed, 8k resolution, cinematic lighting, award winning',
  ', highly detailed, professional photography, dramatic composition, volumetric fog',
  ', concept art, trending on artstation, octane render, hyperrealistic',
  ', digital painting, sharp focus, intricate details, vivid colors, epic scale',
];

/** Comment anti-spam cooldown in ms */
export const COMMENT_COOLDOWN_MS = 5000;

/** Max comment length */
export const COMMENT_MAX_LENGTH = 280;

/** Max password length for validation */
export const PASSWORD_MIN_LENGTH = 8;

/** Max recent images shown in sidebar */
export const MAX_RECENT_IMAGES = 6;

/** Gallery infinite scroll page size */
export const GALLERY_PAGE_SIZE = 8;

// ── Sample data ──────────────────────────────────────────────

export const SAMPLE_GALLERY = [
  { id: 'g1', url: 'https://picsum.photos/seed/art1/512/512', prompt: 'Guerrier cyberpunk sous la pluie neon, 8k ultra detailed', author: 'NeonByte',   authorColor: 'c1', likes: 142, time: '2h',  model: 'FLUX.1 Pro', comments: [] },
  { id: 'g2', url: 'https://picsum.photos/seed/art2/512/512', prompt: 'Dragonne de cristal dans une forêt enchantée, fantasy style',                    author: 'AstralCraft', authorColor: 'c2', likes: 89,  time: '4h',  model: 'SDXL',      comments: [] },
  { id: 'g3', url: 'https://picsum.photos/seed/art3/512/512', prompt: 'Astronaute solitaire sur Mars, golden hour, cinematic',                           author: 'VoidPainter', authorColor: 'c3', likes: 234, time: '6h',  model: 'FLUX.1 Pro', comments: [] },
  { id: 'g4', url: 'https://picsum.photos/seed/art4/512/512', prompt: 'Géisha futuriste, lumières holographiques, anime style',                          author: 'SakurAI',    authorColor: 'c5', likes: 178, time: '8h',  model: 'SD3',       comments: [] },
  { id: 'g5', url: 'https://picsum.photos/seed/art5/512/512', prompt: 'Ville flottante au coucher de soleil, steampunk, volumetric fog',                  author: 'CloudForge', authorColor: 'c4', likes: 95,  time: '12h', model: 'FLUX.1 Pro', comments: [] },
  { id: 'g6', url: 'https://picsum.photos/seed/art6/512/512', prompt: 'Portrait alien bioluminescent, fond sombre, studio lighting',                     author: 'NeonByte',   authorColor: 'c1', likes: 312, time: '1j',  model: 'Midjourney', comments: [] },
  { id: 'g7', url: 'https://picsum.photos/seed/art7/512/512', prompt: 'Forêt de bambou éthérée, brume matinale, photo réaliste',                         author: 'ZenPixel',   authorColor: 'c6', likes: 67,  time: '1j',  model: 'SDXL',      comments: [] },
  { id: 'g8', url: 'https://picsum.photos/seed/art8/512/512', prompt: 'Robot vintage servant du thé, ambiance victorienne',                              author: 'SteamCog',   authorColor: 'c2', likes: 123, time: '2j',  model: 'SD3',       comments: [] },
];

export const PUBLIC_GENERATORS = [
  {
    id: 'pg1',
    name: 'Hero Generator',
    template: '{race} {classe} portant {armure} avec {arme}, style {style}',
    vars: {
      race:    ['Elfe', 'Humain', 'Orc', 'Nain'],
      classe:  ['Guerrier', 'Mage', 'Voleur'],
      armure:  ['armure de dragon', 'cape magique'],
      arme:    ['épée légendaire', 'bâton runique'],
      style:   ['fantasy', 'dark fantasy'],
    },
    author: 'AstralCraft',
    uses: 450,
  },
  {
    id: 'pg2',
    name: 'Landscape Pro',
    template: '{biome} au {moment}, {météo}, style {rendu}, {qualité}',
    vars: {
      biome:   ['désert', 'forêt', 'océan', 'montagne'],
      moment:  ['lever du soleil', 'coucher de soleil', 'nuit étoilée'],
      météo:   ['tempête', 'brume', 'clair'],
      rendu:   ['photorealistic', 'painting'],
      qualité: ['8k', 'ultra detailed'],
    },
    author: 'VoidPainter',
    uses: 289,
  },
];

export const DEFAULT_FORGE_VARS = [
  { name: 'personnage', values: 'guerrier cyberpunk\nmagicienne elfe\npirate de l\'espace\nrobot ancien\nsamouraï fantôme' },
  { name: 'décor',      values: 'ville néon\nforêt enchantée\nstation spatiale\ntemple abandonné\narène sous-marine' },
  { name: 'style',      values: 'anime\nphotoréaliste\npainting\nstudio ghibli\ndark fantasy' },
  { name: 'éclairage',  values: 'lumière dorée\nnéons violets\nclair de lune\nlumière cinématique\ncontre-jour' },
  { name: 'qualité',    values: '8k ultra detailed\nhigh definition\ncinematic render\nstudio quality' },
];

export const SEED_COMMENTS = [
  { imageId: 'g1', comments: [
    { user: 'AstralCraft', text: 'Incroyable ! La composition est parfaite.',         time: '1h', color: 'c2' },
    { user: 'ZenPixel',    text: 'Le néon violet est magnifique. Quel prompt ?',       time: '30m', color: 'c6' },
  ]},
  { imageId: 'g3', comments: [
    { user: 'SakurAI',     text: 'Cette ambiance solitaire est superbe...',            time: '2h', color: 'c5' },
  ]},
];
