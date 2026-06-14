import fs from 'fs';

const tailwindConfigStr = fs.readFileSync('tailwind.config.js', 'utf8');

// We can just use regular expressions or dynamic import to read the values.
// Actually, let's write a simple regex or string replacement script.
// But better yet, I will write the CSS string manually or via script.

async function run() {
  const fileURL = new URL('file://' + process.cwd() + '/tailwind.config.js');
  // It's an ES module, we can import it.
  const config = (await import(fileURL)).default;
  const theme = config.theme.extend;

  let cssTheme = `@theme {\n`;

  // Colors
  for (const [key, value] of Object.entries(theme.colors)) {
    cssTheme += `  --color-${key}: ${value};\n`;
  }

  // Border Radius
  for (const [key, value] of Object.entries(theme.borderRadius)) {
    if (key === 'DEFAULT') {
      cssTheme += `  --radius: ${value};\n`;
    } else {
      cssTheme += `  --radius-${key}: ${value};\n`;
    }
  }

  // Spacing
  for (const [key, value] of Object.entries(theme.spacing)) {
    cssTheme += `  --spacing-${key}: ${value};\n`;
  }

  // FontFamily
  for (const [key, value] of Object.entries(theme.fontFamily)) {
    // value is an array like ["Playfair Display", "serif"]
    cssTheme += `  --font-${key}: '${value[0]}', ${value[1] || 'sans-serif'};\n`;
  }

  // FontSize (e.g. "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }])
  for (const [key, value] of Object.entries(theme.fontSize)) {
    const size = value[0];
    const props = value[1];
    cssTheme += `  --text-${key}: ${size};\n`;
    if (props.lineHeight) cssTheme += `  --text-${key}--line-height: ${props.lineHeight};\n`;
    if (props.letterSpacing) cssTheme += `  --text-${key}--letter-spacing: ${props.letterSpacing};\n`;
    if (props.fontWeight) cssTheme += `  --text-${key}--font-weight: ${props.fontWeight};\n`;
  }

  cssTheme += `}\n\n`;

  const indexCss = fs.readFileSync('src/index.css', 'utf8');
  // Remove @config
  const cleanedCss = indexCss.replace(/@config\s+["'].*?["'];/g, '');
  
  // Insert after @import "tailwindcss";
  const finalCss = cleanedCss.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + cssTheme);

  fs.writeFileSync('src/index.css', finalCss);
  console.log('Successfully updated index.css with @theme');
}

run();
