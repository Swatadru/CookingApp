export const navLinks = [
  { label: 'Inspiration', href: '/' },
  { label: 'Generate', href: '/generate' },
  { label: 'Recipe Library', href: '/library' },
  { label: 'Tech Showcase', href: '/lab' },
  { label: 'My Kitchen', href: '/kitchen' },
];

export const heroContent = {
  titleStart: 'Meet Your',
  titleHighlight: 'AI Sous-Chef',
  description: 'The precision of a professional kitchen meets the intuition of digital intelligence. Craft recipes that transcend ingredients, guided by an omniscient companion that understands your palate and your pantry.',
  buttons: [
    { label: 'Generate Recipe', primary: true },
    { label: 'Explore Recipe Book', primary: false },
  ],
  image: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQBKUMIREti4HiLvshGZavZ8fnipclV8Hqv7Jf_ympGE1xGIew88f8l7s3z4vVNppOBzBJSUBTX3Wlz56uCgKh8Eir6qPxE6IgZq4vhxkuIYFIFF-GxtHx1whuNKo4cDHIPGK8iV0VmtzelHLuwsrPuf3fzbiGiWtib7HVDKhia2OFMpmz3ecqHZWih8vfGt87yKSTNdvOMcRrWSo7nYKJCNkjhaHeHnRBcJqMwOUl8l5rCS8zHvvibgeBg_GcHg0-YqK6n_905fuC',
    alt: 'Cinematic Kitchen Setup',
  },
  aiSuggestion: 'AI is suggesting: Saffron Risotto with Crispy Sage',
};

export const inspirationContent = {
  tag: 'Recipe of the Day',
  quote: '"Today\'s craving might become tomorrow\'s family tradition."',
  image: {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUxFKGRwXOGYoDCFiwR3S2-euCrx9gUnzhAgCFx4S4aA680QnPU8OpG4LxO02NHBdiEwSy35X4ELswd_NGEw-YCvgx3LJP7MKAJX4J57XZkJERGmXTkwxi50_fbu6InYSQ81h1QTGRqZa6WFy938nvcQLU-nJat2zbyR1K4TcvvrtuSMoIhlUxHIK1uIwUacLdGQt_AjFwzY65qektbwN9-nd5ykeNmCF8EIiFzfSEhs5kkgO0rj50gWW3v2gvhMENeuKqC7Db19VU',
    alt: 'Featured Recipe',
  },
  time: '45m',
  calories: '320 kcal',
};

export const chatHistory = [
  {
    role: 'ai',
    text: 'Welcome back! I noticed you have some wild mushrooms and thyme. Shall we try a Creamy Forest Risotto tonight?',
  },
  {
    role: 'user',
    text: 'That sounds perfect. Do I have enough arborio rice?',
  },
];
