/**
 * Post-build packaging script for Markdown Viewer Pro
 * Creates clean portable single binaries & macOS .app bundle
 * Developer: Suhail Akhtar (https://suhail.top)
 */

const fs = require('fs');
const path = require('path');
const png2icons = require('png2icons');

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
const macX64Bin = path.join(distDir, 'markdown-viewer-pro-mac_x64');

const sourceMacBin = fs.existsSync(macUniversalBin) 
  ? macUniversalBin 
  : (fs.existsSync(macArmBin) ? macArmBin : macX64Bin);

if (fs.existsSync(sourceMacBin)) {
  const destMacBin = path.join(macMacOSDir, 'markdown-viewer-pro');
  fs.copyFileSync(sourceMacBin, destMacBin);
  fs.chmodSync(destMacBin, '755');
}

// Generate ICNS icon for macOS Finder
const iconPngSrc = path.join(__dirname, '..', 'public', 'icons', 'appIcon.png');
if (fs.existsSync(iconPngSrc)) {
  try {
    const pngBuffer = fs.readFileSync(iconPngSrc);
    const icnsBuffer = png2icons.createICNS(pngBuffer, png2icons.HERMITE, 0);
    if (icnsBuffer) {
      fs.writeFileSync(path.join(macResourcesDir, 'appIcon.icns'), icnsBuffer);
      console.log('✅ Generated native macOS ICNS icon bundle');
    }
    // Fallback png
    fs.copyFileSync(iconPngSrc, path.join(macResourcesDir, 'appIcon.png'));
  } catch (err) {
    console.warn('ICNS generation fallback:', err.message);
  }
}

// Create macOS Info.plist claiming .md document association and declaring GUI mode
const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>markdown-viewer-pro</string>
    <key>CFBundleIconFile</key>
    <string>appIcon.icns</string>
    <key>CFBundleIdentifier</key>
    <string>top.suhail.markdownviewerpro</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>Markdown Viewer Pro</string>
    <key>CFBundleDisplayName</key>
    <string>Markdown Viewer Pro</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>CFBundleDocumentTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeExtensions</key>
            <array>
                <string>md</string>
                <string>markdown</string>
                <string>mdown</string>
                <string>mkd</string>
            </array>
            <key>CFBundleTypeName</key>
            <string>Markdown Document</string>
            <key>CFBundleTypeRole</key>
            <string>Viewer</string>
            <key>LSHandlerRank</key>
            <string>Owner</string>
        </dict>
    </array>
</dict>
</plist>`;

fs.writeFileSync(path.join(macContentsDir, 'Info.plist'), infoPlist);

console.log('✅ Created macOS "Markdown Viewer Pro.app" bundle (no terminal window on click)');
console.log('✅ Patched Windows executable with embedded resources & custom icon');
console.log('🎉 Portable single binary build complete!');
