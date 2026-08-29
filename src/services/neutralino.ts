/**
 * Neutralinojs Native Desktop Service
 * Provides seamless integration with Neutralino.js native runtime APIs
 * (Window control, native file dialogs, direct filesystem I/O, OS notifications)
 * with robust zero-crash browser fallback.
 * 
 * Developer: Suhail Akhtar (https://suhail.top)
 */

import * as Neutralino from '@neutralinojs/lib';

let isInitialized = false;

/**
 * Checks if the application is running inside a Neutralino.js native desktop window.
 */
export function isNativeNeutralino(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { NL_PORT?: number }).NL_PORT !== undefined ||
    (window as unknown as { Neutralino?: unknown }).Neutralino !== undefined
  );
}

/**
 * Initialize Neutralino Native Runtime.
 * Must be called early in the app lifecycle.
 */
export async function initNeutralino(): Promise<boolean> {
  if (!isNativeNeutralino()) {
    return false;
  }

  if (isInitialized) {
    return true;
  }

  try {
    Neutralino.init();
    isInitialized = true;

    // Register native window close / lifecycle events
    Neutralino.events.on('windowClose', () => {
      Neutralino.app.exit();
    });

    console.log('⚡ Neutralinojs Native Runtime Initialized Successfully');
    return true;
  } catch (error) {
    console.warn('Neutralino.init() skipped or running in preview web mode:', error);
    return false;
  }
}

/**
 * Show native OS File Open Dialog and read file content
 */
export async function showNativeOpenFileDialog(): Promise<{ name: string; path: string; content: string } | null> {
  if (!isNativeNeutralino()) {
    return null;
  }

  try {
    const entries = await Neutralino.os.showOpenDialog(
      'Open Markdown Document',
      {
        filters: [
          { name: 'Markdown Files (*.md, *.markdown)', extensions: ['md', 'markdown', 'mdown', 'mkdn', 'txt'] },
          { name: 'All Files (*.*)', extensions: ['*'] }
        ],
        multiSelections: false
      }
    );

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return null;
    }

    const filePath = entries[0];
    if (!filePath) return null;

    const content = await Neutralino.filesystem.readFile(filePath);
    
    // Extract filename from path
    const fileName = filePath.split(/[\\/]/).pop() || 'Untitled.md';

    return {
      name: fileName,
      path: filePath,
      content
    };
  } catch (error) {
    console.error('Failed to open native file via Neutralino:', error);
    return null;
  }
}

/**
 * Check command line arguments passed on launch (e.g. double-clicking .md file in Finder/Explorer)
 */
export async function checkForOpenedFileFromArgs(): Promise<{ name: string; path: string; content: string } | null> {
  if (!isNativeNeutralino()) return null;

  try {
    const args = (window as any).NL_ARGS || [];
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      if (
        arg &&
        typeof arg === 'string' &&
        !arg.startsWith('-') &&
        (arg.endsWith('.md') ||
          arg.endsWith('.markdown') ||
          arg.endsWith('.mdown') ||
          arg.endsWith('.mkdn') ||
          arg.endsWith('.txt') ||
          arg.includes('/') ||
          arg.includes('\\'))
      ) {
        try {
          const content = await Neutralino.filesystem.readFile(arg);
          const fileName = arg.split(/[\\/]/).pop() || 'Opened.md';
          return {
            name: fileName,
            path: arg,
            content,
          };
        } catch (e) {
          console.warn('Could not read file from command line arg:', arg, e);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse NL_ARGS:', err);
  }

  return null;
}

export interface DefaultAppRegistrationResult {
  success: boolean;
  os: 'Windows' | 'Darwin' | 'Linux' | 'Unknown';
  message: string;
  commandExecuted?: string;
  manualInstructions?: string;
}

/**
 * Register Markdown Viewer Pro as default application for .md files on Windows, macOS, and Linux
 */
export async function registerDefaultAppForMarkdown(): Promise<DefaultAppRegistrationResult> {
  const osName = (typeof window !== 'undefined' && (window as any).NL_OS) ? (window as any).NL_OS : 'Unknown';

  if (!isNativeNeutralino()) {
    return {
      success: false,
      os: osName as any,
      message: 'Default app registration requires running inside the Markdown Viewer Pro native desktop app.',
      manualInstructions:
        'To set Markdown Viewer Pro as your default viewer:\n- macOS: Right click any .md file > Get Info > Open with > Markdown Viewer Pro > Change All.\n- Windows: Right click any .md file > Open with > Choose another app > Always use this app.\n- Linux: Right click .md file > Properties > Open With > Set as default.',
    };
  }

  try {
    const args = (window as any).NL_ARGS || [];
    const appBinaryPath = args[0] || ((window as any).NL_PATH ? `${(window as any).NL_PATH}/markdown-viewer-pro` : 'markdown-viewer-pro');

    if (osName === 'Windows') {
      const winExe = appBinaryPath.replace(/\//g, '\\');
      const cmd = `assoc .md=MarkdownViewerPro.Document && ftype MarkdownViewerPro.Document="${winExe}" "%1" && reg add "HKCU\\Software\\Classes\\.md" /ve /d "MarkdownViewerPro.Document" /f && reg add "HKCU\\Software\\Classes\\MarkdownViewerPro.Document\\shell\\open\\command" /ve /d "\"${winExe}\" \"%1\"" /f`;
      
      try {
        const res = await Neutralino.os.execCommand(cmd);
        if (res.exitCode === 0 || res.exitCode === undefined) {
          return {
            success: true,
            os: 'Windows',
            message: 'Markdown Viewer Pro was successfully set as the default application for .md files on Windows!',
            commandExecuted: cmd,
          };
        }
      } catch (e) {
        console.warn('Windows command failed, providing registry fallback instructions:', e);
      }

      return {
        success: false,
        os: 'Windows',
        message: 'Administrator privilege may be needed for command execution.',
        commandExecuted: cmd,
        manualInstructions:
          '1. Right-click any .md file in Windows File Explorer.\n2. Click "Open with" -> "Choose another app".\n3. Select "Markdown Viewer Pro".\n4. Check "Always use this app to open .md files" and click OK.',
      };
    } else if (osName === 'Linux') {
      const desktopFileContent = `[Desktop Entry]\nName=Markdown Viewer Pro\nExec="${appBinaryPath}" %f\nType=Application\nMimeType=text/markdown;text/x-markdown;text/plain;\nIcon=markdown-viewer-pro\nTerminal=false\nCategories=Utility;TextEditor;\n`;
      const desktopFilePath = `${(window as any).NL_DATAPATH || '~/.local/share/applications'}/markdown-viewer-pro.desktop`;
      
      try {
        await Neutralino.filesystem.writeFile(desktopFilePath, desktopFileContent);
        await Neutralino.os.execCommand(`xdg-mime default markdown-viewer-pro.desktop text/markdown text/x-markdown`);
      } catch (e) {
        await Neutralino.os.execCommand(`xdg-mime default markdown-viewer-pro.desktop text/markdown`);
      }

      return {
        success: true,
        os: 'Linux',
        message: 'Markdown Viewer Pro registered as default handler for text/markdown via xdg-mime!',
      };
    } else if (osName === 'Darwin') {
      try {
        const dutiRes = await Neutralino.os.execCommand(`duti -s top.suhail.markdownviewerpro .md all`);
        if (dutiRes && dutiRes.exitCode === 0) {
          return {
            success: true,
            os: 'Darwin',
            message: 'Set as default .md handler on macOS via duti!',
          };
        }
      } catch (e) {
        // duti not installed, fallback to step-by-step
      }

      return {
        success: true,
        os: 'Darwin',
        message: 'Follow these quick steps in macOS Finder to set Markdown Viewer Pro as your default .md reader:',
        manualInstructions:
          '1. Right-click (or Control-click) any .md file in macOS Finder.\n2. Click "Get Info" (Cmd + I).\n3. Under "Open with:", select "Markdown Viewer Pro".\n4. Click "Change All..." and confirm.',
      };
    }
  } catch (error: any) {
    console.error('Failed to register default app:', error);
  }

  return {
    success: false,
    os: osName as any,
    message: 'Set as default via your system File Manager by choosing "Open With" -> Markdown Viewer Pro.',
    manualInstructions:
      'Right-click any .md file -> Open With / Get Info -> Select Markdown Viewer Pro and check "Always use this app".',
  };
}

/**
 * Save content to native file path
 */
export async function writeNativeFile(filePath: string, content: string): Promise<boolean> {
  if (!isNativeNeutralino()) {
    return false;
  }

  try {
    await Neutralino.filesystem.writeFile(filePath, content);
    return true;
  } catch (error) {
    console.error('Failed to save native file via Neutralino:', error);
    return false;
  }
}

/**
 * Show native OS File Save Dialog
 */
export async function showNativeSaveFileDialog(defaultName: string, content: string): Promise<string | null> {
  if (!isNativeNeutralino()) {
    return null;
  }

  try {
    const defaultPath = defaultName.endsWith('.md') ? defaultName : `${defaultName}.md`;
    const selectedPath = await Neutralino.os.showSaveDialog(
      'Save Markdown Document',
      {
        defaultPath,
        filters: [
          { name: 'Markdown Document (*.md)', extensions: ['md'] },
          { name: 'All Files (*.*)', extensions: ['*'] }
        ]
      }
    );

    if (!selectedPath) {
      return null;
    }

    await Neutralino.filesystem.writeFile(selectedPath, content);
    return selectedPath;
  } catch (error) {
    console.error('Failed to save file dialog via Neutralino:', error);
    return null;
  }
}

/**
 * Display native OS desktop notification
 */
export async function showNativeNotification(title: string, content: string): Promise<void> {
  if (!isNativeNeutralino()) {
    return;
  }

  try {
    await Neutralino.os.showNotification(title, content);
  } catch (error) {
    console.warn('Native notification failed:', error);
  }
}

/**
 * Open external web URL in user's default system browser
 */
export async function openExternalUrl(url: string): Promise<void> {
  if (isNativeNeutralino()) {
    try {
      await Neutralino.os.open(url);
      return;
    } catch (e) {
      console.warn('Neutralino.os.open failed, falling back to window.open:', e);
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Copy text to clipboard natively with web fallback
 */
export async function copyTextNative(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    }
    if (isNativeNeutralino()) {
      await Neutralino.clipboard.writeText(text);
    }
    return true;
  } catch (err) {
    if (isNativeNeutralino()) {
      try {
        await Neutralino.clipboard.writeText(text);
        return true;
      } catch (e) {
        console.error('Clipboard native copy error:', e);
      }
    }
    return false;
  }
}

/**
 * Save exported HTML file natively to disk
 */
export async function showNativeSaveHtmlDialog(defaultName: string, htmlContent: string): Promise<string | null> {
  if (!isNativeNeutralino()) {
    return null;
  }

  try {
    const defaultPath = defaultName.endsWith('.html') ? defaultName : `${defaultName}.html`;
    const selectedPath = await Neutralino.os.showSaveDialog(
      'Export HTML Document',
      {
        defaultPath,
        filters: [
          { name: 'HTML Document (*.html)', extensions: ['html', 'htm'] },
          { name: 'All Files (*.*)', extensions: ['*'] }
        ]
      }
    );

    if (!selectedPath) {
      return null;
    }

    await Neutralino.filesystem.writeFile(selectedPath, htmlContent);
    return selectedPath;
  } catch (error) {
    console.error('Failed to export HTML via Neutralino:', error);
    return null;
  }
}

/**
 * Read native file from disk
 */
export async function readNativeFile(filePath: string): Promise<string | null> {
  if (!isNativeNeutralino()) {
    return null;
  }

  try {
    return await Neutralino.filesystem.readFile(filePath);
  } catch (error) {
    console.error('Failed to read native file:', error);
    return null;
  }
}

/**
 * Reveal file/folder in native OS file manager
 */
export async function showInFolder(filePath: string): Promise<void> {
  if (!isNativeNeutralino()) {
    return;
  }

  try {
    if (typeof (Neutralino.os as any).showFolder === 'function') {
      await (Neutralino.os as any).showFolder(filePath);
    } else if (typeof (Neutralino.os as any).open === 'function') {
      await (Neutralino.os as any).open(filePath);
    }
  } catch (error) {
    console.warn('Neutralino show in folder failed:', error);
  }
}

/**
 * Native Window Controls
 */
export async function nativeMinimizeWindow(): Promise<void> {
  if (isNativeNeutralino()) {
    try {
      await Neutralino.window.minimize();
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function nativeMaximizeWindow(): Promise<void> {
  if (isNativeNeutralino()) {
    try {
      const isMax = await Neutralino.window.isMaximized();
      if (isMax) {
        await Neutralino.window.unmaximize();
      } else {
        await Neutralino.window.maximize();
      }
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function nativeCloseWindow(): Promise<void> {
  if (isNativeNeutralino()) {
    try {
      await Neutralino.app.exit();
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function setNativeWindowTitle(title: string): Promise<void> {
  if (isNativeNeutralino()) {
    try {
      await Neutralino.window.setTitle(`${title} — Markdown Viewer Pro`);
    } catch (e) {
      console.warn(e);
    }
  }
}
