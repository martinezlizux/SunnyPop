const fs = require('fs');

let fileContent = fs.readFileSync('/Users/lizmartinez/.gemini/antigravity/brain/ab5fbe2c-5e69-4ea3-93e2-a3873e8b995b/.system_generated/steps/83/output.txt', 'utf8');

// Extract all image constants
const regex = /const (img[a-zA-Z0-9_]+) = "http:\/\/localhost:3845\/assets\/([^"]+)";/g;
let match;
let imageMap = {};

while ((match = regex.exec(fileContent)) !== null) {
  imageMap[match[1]] = `assets/${match[2]}`;
}

// Extract IPhone function
let reactCode = fileContent.substring(fileContent.indexOf('<div className="bg-'), fileContent.lastIndexOf(');')).trim();

// Replace images
for (const [varName, path] of Object.entries(imageMap)) {
  reactCode = reactCode.replace(new RegExp(`{${varName}}`, 'g'), `"${path}"`);
}
reactCode = reactCode.replace(/className=/g, 'class=');

// Extract Frame function body
let frameCode = fileContent.substring(fileContent.indexOf('function Frame'), fileContent.indexOf('export default'));
let frameHtml = frameCode.substring(frameCode.indexOf('<div className={'), frameCode.lastIndexOf(');')).trim();
for (const [varName, path] of Object.entries(imageMap)) {
  frameHtml = frameHtml.replace(new RegExp(`{${varName}}`, 'g'), `"${path}"`);
}
frameHtml = frameHtml.replace(/className={className \|\| "([^"]+)"}/g, 'class="$1"');
frameHtml = frameHtml.replace(/className=/g, 'class=');

reactCode = reactCode.replace(/<Frame class="([^"]+)" \/>/g, (match, p1) => {
  return frameHtml.replace(/<div class="([^"]+)"/, `<div class="$1 ${p1}"`);
});

// Convert Tailwind classes to inline styles for EVERYTHING
reactCode = reactCode.replace(/class="([^"]+)"/g, (match, p1) => {
  let styleStr = '';
  // preserve some classes for custom styling
  let retainedClasses = [];

  const rules = {
    'absolute': 'position: absolute;',
    'relative': 'position: relative;',
    'flex': 'display: flex;',
    'inline-grid': 'display: inline-grid;',
    'grid': 'display: grid;',
    'contents': 'display: contents;',
    'block': 'display: block;',
    'justify-center': 'justify-content: center;',
    'items-center': 'align-items: center;',
    'place-items-start': 'place-items: start;',
    'flex-col': 'flex-direction: column;',
    'size-full': 'width: 100%; height: 100%;',
    'shrink-0': 'flex-shrink: 0;',
    'leading-\\[0\\]': 'line-height: 0;',
    'leading-\\[normal\\]': 'line-height: normal;',
    'leading-\\[70px\\]': 'line-height: 70px;',
    'leading-\\[20px\\]': 'line-height: 20px;',
    'text-center': 'text-align: center;',
    'whitespace-pre-wrap': 'white-space: pre-wrap;',
    'mix-blend-multiply': 'mix-blend-mode: multiply;',
    'mix-blend-soft-light': 'mix-blend-mode: soft-light;',
    'col-1': 'grid-column: 1;',
    'row-1': 'grid-row: 1;',
    'inset-0': 'inset: 0;',
    'max-w-none': 'max-width: none;',
    'w-full': 'width: 100%;',
    'h-full': 'height: 100%;',
    'min-h-px': 'min-height: 1px;',
    'min-w-px': 'min-width: 1px;',
    // Transform translations
    "-translate-x-1\\/2": "transform: translateX(-50%);",
    "-translate-y-1\\/2": "transform: translateY(-50%);",
    "font-\\[\'Jua:Regular\',sans-serif\\]": "font-family: 'Jua', sans-serif;",
    "font-\\[\'Font_Awesome_5_Free:Solid\',sans-serif\\]": "font-family: 'FontAwesome';",
    "not-italic": "font-style: normal;"
  };

  const dynamicRegexes = [
    { re: /^w-\[(.+)\]$/, fn: m => `width: ${m[1]};` },
    { re: /^h-\[(.+)\]$/, fn: m => `height: ${m[1]};` },
    { re: /^size-\[(.+)\]$/, fn: m => `width: ${m[1]}; height: ${m[1]};` },
    { re: /^top-\[(.+)\]$/, fn: m => `top: ${m[1]};` },
    { re: /^left-\[(.+)\]$/, fn: m => `left: ${m[1]};` },
    { re: /^ml-\[(.+)\]$/, fn: m => `margin-left: ${m[1]};` },
    { re: /^ml-(.+)$/, fn: m => `margin-left: ${m[1] === '0' ? '0' : m[1]};` },
    { re: /^mt-\[(.+)\]$/, fn: m => `margin-top: ${m[1]};` },
    { re: /^mt-(.+)$/, fn: m => `margin-top: ${m[1] === '0' ? '0' : m[1]};` },
    { re: /^gap-\[(.+)\]$/, fn: m => `gap: ${m[1]};` },
    { re: /^p-\[(.+)\]$/, fn: m => `padding: ${m[1]};` },
    { re: /^py-\[(.+)\]$/, fn: m => `padding-top: ${m[1]}; padding-bottom: ${m[1]};` },
    { re: /^px-\[(.+)\]$/, fn: m => `padding-left: ${m[1]}; padding-right: ${m[1]};` },
    { re: /^text-\[(.+)px\]$/, fn: m => `font-size: ${m[1]}px;` },
    { re: /^bg-\[var\((.+?),(.+?)\)\]$/, fn: m => `background-color: var(${m[1]}, ${m[2]});` },
    { re: /^text-\[color:var\((.+?),(.+?)\)\]$/, fn: m => `color: var(${m[1]}, ${m[2]});` },
    { re: /^inset-\[(.+)\]$/, fn: m => `inset: ${m[1].replace(/_/g, ' ')};` },
    { re: /^flex-\[(.+)\]$/, fn: m => `flex: ${m[1].replace(/_/g, ' ')};` },
    { re: /^grid-cols-\[(.+)\]$/, fn: m => `grid-template-columns: ${m[1]};` },
    { re: /^grid-rows-\[(.+)\]$/, fn: m => `grid-template-rows: ${m[1]};` },
    { re: /^rounded-\[(.+)\]$/, fn: m => `border-radius: ${m[1]};` }
  ];

  p1.split(' ').forEach(cls => {
    let replaced = false;
    // Check exact matches
    const exactMatch = Object.keys(rules).find(k => new RegExp(`^${k}$`).test(cls));
    if (exactMatch) {
      styleStr += rules[exactMatch] + ' ';
      replaced = true;
    } else {
      // Check dynamic matches
      for (const rule of dynamicRegexes) {
        const m = cls.match(rule.re);
        if (m) {
          let s = rule.fn(m);
          // Fix variable slashes
          s = s.replace(/\\\//g, '-');
          s = s.replace(/--colors-forecast-background/, '--colors-forecast-background');
          styleStr += s + ' ';
          replaced = true;
          break;
        }
      }
    }
    if (!replaced) retainedClasses.push(cls);
  });

  // some fixes for unescaped classes
  if (retainedClasses.length > 0 && styleStr.length > 0) {
    return `class="${retainedClasses.join(' ')}" style="${styleStr.trim()}"`;
  } else if (styleStr.length > 0) {
    return `style="${styleStr.trim()}"`;
  }
  return match;
});

// Specific fix to wrap -translate-x and -translate-y properly in top/left since we injected tranlsate inline
reactCode = reactCode.replace(/style="transform: translateX\(-50%\); transform: translateY\(-50%\);(.*)"/g, 'style="transform: translate(-50%, -50%);$1"');

// Write the parsed HTML without CDN Tailwind
let finalHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SunnyPop</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Jua&display=swap" rel="stylesheet">
    
    <!-- FontAwesome Elements for Icons -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    
    <link href="css/main.css" rel="stylesheet">
    <style>
      body {
        background-color: #1a1e2d; /* Background around the simulated phone */
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
      }
      /* Ensure that SVG paths match SCSS vars */
      * { box-sizing: border-box; }
    </style>
  </head>
  <!-- App Wrapper Frame -->
  <body class="theme-tormenta">
      <div style="width: 402px; height: 874px; position: relative; overflow: hidden; border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        ${reactCode}
      </div>
  </body>
</html>
`;

fs.writeFileSync('index.html', finalHtml);
console.log('HTML written to index.html with inline styles (Tailwind removed)');
