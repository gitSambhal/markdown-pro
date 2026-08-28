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

    if (!entries || entries.length === 0) {
      return null;
    }

    const filePath = entries[0];
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
