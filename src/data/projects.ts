export type FilmStep = {
  id: string;
  label: string;
  title: string;
  feeling: string[];
  meaning: string;
  center: string;
  accent: string;
};

export type Project = {
  id: string;
  name: string;
  subtitle: string;
  steps: FilmStep[];
};

export const projects: Project[] = [
  {
    id: 'livetile',
    name: 'LIVETILE',
    subtitle: 'Plants → Architecture',
    steps: [
      {
        id: 'question',
        label: 'Question',
        title: 'WHY ARE WALLS STILL DEAD?',
        feeling: ['dead', 'flat', 'paint', 'empty'],
        meaning: 'A wall is usually painted, covered, decorated or ignored. The first question breaks the habit.',
        center: 'WALLS',
        accent: '#40ff63'
      },
      {
        id: 'feeling',
        label: 'Feeling',
        title: 'PAINT. REPEAT. FLATNESS.',
        feeling: ['boring', 'static', 'repeated', 'passive'],
        meaning: 'The emotional layer is not about plants yet. It is about the fatigue of the passive wall.',
        center: 'FLATNESS',
        accent: '#cfc6b8'
      },
      {
        id: 'image',
        label: 'Image',
        title: 'JUNGLE TAKES THE CITY.',
        feeling: ['jungle', 'spider', 'ruins', 'life'],
        meaning: 'The mind starts drifting: coats, walls, Spider-Man, vines, abandoned cities, life climbing architecture.',
        center: 'JUNGLE',
        accent: '#25d44f'
      },
      {
        id: 'frame',
        label: 'Frame',
        title: 'PLANTS BECOME SURFACE.',
        feeling: ['alive', 'modular', 'hex', 'growing'],
        meaning: 'The frame changes. It is no longer a pot or a garden. It becomes an architectural surface.',
        center: 'ARCHITECTURE',
        accent: '#40ff63'
      },
      {
        id: 'reality',
        label: 'Reality',
        title: 'A NEW LAYER OF HOME.',
        feeling: ['desire', 'future', 'home', 'wow'],
        meaning: 'LiveTile is the material result: fresh greens, built into the wall.',
        center: 'LIVETILE',
        accent: '#40ff63'
      }
    ]
  },
  {
    id: 'speakfit',
    name: 'SPEAKFIT',
    subtitle: 'Language → Fitness',
    steps: [
      {
        id: 'question',
        label: 'Question',
        title: 'WHY DOES LANGUAGE LEARNING FEEL LIKE SCHOOL?',
        feeling: ['school', 'homework', 'slow', 'tired'],
        meaning: 'The question attacks the old frame: lessons, grammar, waiting for results.',
        center: 'LANGUAGE',
        accent: '#ff6a00'
      },
      {
        id: 'feeling',
        label: 'Feeling',
        title: 'NO RESULT. NO BODY. NO PULSE.',
        feeling: ['boredom', 'shame', 'delay', 'routine'],
        meaning: 'The emotional truth is simple: people want progress they can feel.',
        center: 'PROGRESS',
        accent: '#c8ff00'
      },
      {
        id: 'image',
        label: 'Image',
        title: 'A GYM FOR LANGUAGE.',
        feeling: ['training', 'coach', 'sets', 'energy'],
        meaning: 'The image pulls language out of school and into training.',
        center: 'TRAINING',
        accent: '#ff6a00'
      },
      {
        id: 'frame',
        label: 'Frame',
        title: 'LEARNING BECOMES FITNESS.',
        feeling: ['measure', 'repeat', 'sweat', 'gain'],
        meaning: 'A new category appears: diagnosis, technique, rhythm, trainer, progress.',
        center: 'FITNESS',
        accent: '#c8ff00'
      },
      {
        id: 'reality',
        label: 'Reality',
        title: 'SPEAKFIT.',
        feeling: ['drive', 'result', 'body', 'voice'],
        meaning: 'A language product built like a fitness system.',
        center: 'SPEAKFIT',
        accent: '#ff6a00'
      }
    ]
  },
  {
    id: 'olga',
    name: 'OLGA',
    subtitle: 'Astrology → Clarity',
    steps: [
      {
        id: 'question',
        label: 'Question',
        title: 'WHY ARE PEOPLE LOOKING FOR PREDICTIONS?',
        feeling: ['fear', 'future', 'choice', 'fog'],
        meaning: 'The point is not prediction. It is the need to stop moving blindly.',
        center: 'ASTROLOGY',
        accent: '#d00022'
      },
      {
        id: 'feeling',
        label: 'Feeling',
        title: 'UNCERTAINTY WANTS A SHAPE.',
        feeling: ['anxiety', 'waiting', 'hope', 'fragile'],
        meaning: 'Under the request is a human wish for orientation.',
        center: 'FOG',
        accent: '#d00022'
      },
      {
        id: 'image',
        label: 'Image',
        title: 'A NAVIGATION SYSTEM FOR LIFE.',
        feeling: ['route', 'stars', 'lighthouse', 'window'],
        meaning: 'The image becomes navigation, not mysticism.',
        center: 'NAVIGATION',
        accent: '#d00022'
      },
      {
        id: 'frame',
        label: 'Frame',
        title: 'ASTROLOGY BECOMES CLARITY.',
        feeling: ['calm', 'decision', 'timing', 'self'],
        meaning: 'The frame changes from fortune-telling to understanding.',
        center: 'CLARITY',
        accent: '#d00022'
      },
      {
        id: 'reality',
        label: 'Reality',
        title: 'OLGA TKACHENKO.',
        feeling: ['elegant', 'white', 'red', 'clear'],
        meaning: 'A premium personal site around clarity, not esotericism.',
        center: 'OLGA',
        accent: '#d00022'
      }
    ]
  },
  {
    id: 'soma',
    name: 'SOMA',
    subtitle: 'Hotel → Frequency',
    steps: [
      {
        id: 'question',
        label: 'Question',
        title: 'WHY DO HOTELS FEEL THE SAME?',
        feeling: ['same', 'neutral', 'quiet', 'forgotten'],
        meaning: 'The question opens a hidden layer: not rooms, but mood.',
        center: 'HOTEL',
        accent: '#7a5cff'
      },
      {
        id: 'feeling',
        label: 'Feeling',
        title: 'A PLACE NEEDS A FREQUENCY.',
        feeling: ['sound', 'night', 'signal', 'private'],
        meaning: 'The emotional core is a room tuned to a state.',
        center: 'MOOD',
        accent: '#7a5cff'
      },
      {
        id: 'image',
        label: 'Image',
        title: 'ROOMS AS STATIONS.',
        feeling: ['radio', 'wave', 'ambient', 'sleep'],
        meaning: 'A hotel can become a space of frequencies.',
        center: 'SIGNAL',
        accent: '#7a5cff'
      },
      {
        id: 'frame',
        label: 'Frame',
        title: 'HOTEL BECOMES FREQUENCY.',
        feeling: ['tuned', 'deep', 'soft', 'hidden'],
        meaning: 'The new category is not accommodation. It is atmosphere.',
        center: 'FREQUENCY',
        accent: '#7a5cff'
      },
      {
        id: 'reality',
        label: 'Reality',
        title: 'SOMA FM.',
        feeling: ['dark', 'room', 'music', 'escape'],
        meaning: 'A hotel concept built around sound and inner state.',
        center: 'SOMA',
        accent: '#7a5cff'
      }
    ]
  },
  {
    id: 'chaveta',
    name: 'CHAVETA',
    subtitle: 'Catalog → Club',
    steps: [
      {
        id: 'question',
        label: 'Question',
        title: 'WHY DOES A CATALOG FEEL COLD?',
        feeling: ['list', 'price', 'filter', 'cold'],
        meaning: 'A catalog sells items. But the client wants atmosphere and belonging.',
        center: 'CATALOG',
        accent: '#b89a5e'
      },
      {
        id: 'feeling',
        label: 'Feeling',
        title: 'THE PRODUCT NEEDS A ROOM.',
        feeling: ['dark', 'gold', 'private', 'slow'],
        meaning: 'The emotional layer is lounge, not ecommerce.',
        center: 'ATMOSPHERE',
        accent: '#b89a5e'
      },
      {
        id: 'image',
        label: 'Image',
        title: 'A PRIVATE CLUB ONLINE.',
        feeling: ['club', 'ritual', 'velvet', 'table'],
        meaning: 'The image moves the site from shop to space.',
        center: 'CLUB',
        accent: '#b89a5e'
      },
      {
        id: 'frame',
        label: 'Frame',
        title: 'CATALOG BECOMES CLUB.',
        feeling: ['warm', 'dense', 'selected', 'inside'],
        meaning: 'The new frame gives the catalog a social atmosphere.',
        center: 'CURATED',
        accent: '#b89a5e'
      },
      {
        id: 'reality',
        label: 'Reality',
        title: 'CHAVETA.',
        feeling: ['premium', 'dark', 'gold', 'lounge'],
        meaning: 'A premium atmosphere placed over an existing catalog.',
        center: 'CHAVETA',
        accent: '#b89a5e'
      }
    ]
  }
];
