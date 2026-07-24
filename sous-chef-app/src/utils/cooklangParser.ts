export interface CooklangStep {
  text: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  cookware: { name: string }[];
  timers: { name: string; duration: string; unit: string }[];
}

export interface ParsedRecipe {
  title: string;
  steps: CooklangStep[];
}

export function parseCooklang(source: string): ParsedRecipe {
  const steps: CooklangStep[] = [];
  const lines = source.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let title = 'Untitled Recipe';

  for (const line of lines) {
    if (line.startsWith('>> title:')) {
      title = line.replace('>> title:', '').trim();
      continue;
    }
    if (line.startsWith('>>')) continue;

    const step: CooklangStep = {
      text: line,
      ingredients: [],
      cookware: [],
      timers: []
    };

    // Very basic Cooklang regex parsing for demonstration
    // Ingredients: @ingredient{quantity%unit}
    const ingredientRegex = /@([^{]+)\{([^%}]+)%([^}]+)\}/g;
    let match;
    while ((match = ingredientRegex.exec(line)) !== null) {
      step.ingredients.push({ name: match[1], quantity: match[2], unit: match[3] });
    }

    // Cookware: #cookware{}
    const cookwareRegex = /#([^{]+)\{\}/g;
    while ((match = cookwareRegex.exec(line)) !== null) {
      step.cookware.push({ name: match[1] });
    }

    // Timers: ~timer{duration%unit}
    const timerRegex = /~([^{]*)\{([^%}]+)%([^}]+)\}/g;
    while ((match = timerRegex.exec(line)) !== null) {
      step.timers.push({ name: match[1], duration: match[2], unit: match[3] });
    }

    steps.push(step);
  }

  return { title, steps };
}
