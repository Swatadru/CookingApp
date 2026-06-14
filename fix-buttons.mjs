import fs from 'fs';
import path from 'path';

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // For specific routing actions
  const routing = {
    'Cook with AI': "window.location.href='/kitchen'",
    'Start Cooking Session': "window.location.href='/kitchen'",
    'Start Cooking': "window.location.href='/kitchen'",
    'EXPLORE LABS': "window.location.href='/lab'",
    'Explore Recipe Book': "window.location.href='/library'",
    'View Recipe': "window.location.href='/library'",
    'Jump to Page': "window.location.href='/library'",
  };

  // Find all <button ...> tags
  content = content.replace(/<button([^>]*)>(.*?)<\/button>/gs, (match, attrs, innerText) => {
    if (attrs.includes('onClick=')) {
      return match;
    }

    let action = 'alert("Action not implemented yet")';
    
    // Check if innerText matches any routing
    for (const [key, value] of Object.entries(routing)) {
      if (innerText.includes(key)) {
        action = value;
        break;
      }
    }

    changed = true;
    return `<button${attrs} onClick={() => ${action}}>${innerText}</button>`;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated buttons in ${file}`);
  }
});
