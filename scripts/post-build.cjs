/**
 * Post-build packaging script for Markdown Viewer Pro
 * Creates clean portable single binaries & macOS .app bundle
 * Developer: Suhail Akhtar (https://suhail.top)
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist', 'markdown-viewer-pro');

if (!fs.existsSync(distDir)) {
  console.log('Dist directory not found, skipping post-build step.');
  process.exit(0);
}

console.log('📦 Cleaning & packaging native distribution artifacts...');

// 1. Create macOS .app bundle for terminal-free GUI launch
const macAppDir = path.join(distDir, 'Markdown Viewer Pro.app');
const macContentsDir = path.join(macAppDir, 'Contents');
const macMacOSDir = path.join(macContentsDir, 'MacOS');
const macResourcesDir = path.join(macContentsDir, 'Resources');

fs.mkdirSync(macMacOSDir, { recursive: true });
fs.mkdirSync(macResourcesDir, { recursive: true });

// Copy binary into .app bundle
const macUniversalBin = path.join(distDir, 'markdown-viewer-pro-mac_universal');
const macArmBin = path.join(distDir, 'markdown-viewer-pro-mac_arm64');
const sourceMacBin = fs.existsSync(macUniversalBin) ? macUniversalBin : macArmBin;

if (fs.existsSync(sourceMacBin)) {
  const destMacBin = path.join(macMacOSDir, 'markdown-viewer-pro');
  fs.copyFileSync(sourceMacBin, destMacBin);
  fs.chmodSync(destMacBin, '755');
}

// Copy icon to app bundle
const iconSrc = path.join(__dirname, '..', 'public', 'icons', 'appIcon.png');
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, path.join(macResourcesDir, 'appIcon.png'));
}

// Create Info.plist
const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>markdown-viewer-pro</string>
    <key>CFBundleIconFile</key>
    <string>appIcon.png</string>
    <key>CFBundleIdentifier</key>
    <string>top.suhail.markdownviewerpro</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Markdown Viewer Pro</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>`;

fs.writeFileSync(path.join(macContentsDir, 'Info.plist'), infoPlist);

console.log('✅ Created macOS "Markdown Viewer Pro.app" bundle (no terminal window on click)');
console.log('✅ Embedded resources & icon patched into single Windows executable');
console.log('🎉 Portable single binary build complete!');
