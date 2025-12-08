import { EditorView, ViewUpdate } from '@codemirror/view';
import type RememberCodeBlockLangPlugin from '../main';

// Debounce helper
function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return function (...args: Parameters<T>) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function createLanguageTracker(plugin: RememberCodeBlockLangPlugin) {
    // Debounced save function to avoid excessive disk writes
    const debouncedSave = debounce(async (language: string) => {
        if (language && language !== plugin.settings.lastUsedLanguage) {
            plugin.settings.lastUsedLanguage = language;
            await plugin.saveSettings();
        }
    }, 300);

    return EditorView.updateListener.of((update: ViewUpdate) => {
        // Only process document changes
        if (!update.docChanged) {
            return;
        }

        // Check each change to see if it affects a code block info line
        update.changes.iterChanges((fromA, toA, fromB, toB) => {
            // Get the affected range in the new document
            const doc = update.state.doc;

            // Check lines that were affected by the change
            const startLine = doc.lineAt(fromB);
            const endLine = doc.lineAt(Math.min(toB, doc.length));

            for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
                const line = doc.line(lineNum);
                const lineText = line.text.trim();

                // Check if this line is a code block opening with a language
                // Pattern: ``` followed by word characters (language identifier)
                const match = lineText.match(/^```(\w+)/);

                if (match && match[1]) {
                    const language = match[1];
                    // Save the language (debounced)
                    debouncedSave(language);
                    // Only process the first match to avoid redundant saves
                    return;
                }
            }
        });
    });
}

