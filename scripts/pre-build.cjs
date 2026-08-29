/**
 * Pre-build script for Markdown Viewer Pro
 * Pre-patches Windows template binary with custom ICO icon
 * Developer: Suhail Akhtar (https://suhail.top)
 */

const path = require('path');
const fs = require('fs');

async function preBuild() {
  console.log('🎨 Pre-patching Windows template binary icon...');
  try {
    const exepatchPath = path.join(__dirname, '..', 'node_modules', '@neutralinojs', 'neu', 'src', 'modules', 'exepatch.js');
    if (fs.existsSync(exepatchPath)) {
      const exepatch = require(exepatchPath);
      const winBin = path.join(__dirname, '..', 'bin', 'neutralino-win_x64.exe');
      if (fs.existsSync(winBin)) {
        await exepatch.patchWindowsExecutable(winBin);
        console.log('✅ Template Windows binary successfully patched with custom app icon!');
      }
    }
  } catch (e) {
    console.warn('Pre-build warning:', e.message);
  }
}

preBuild();
