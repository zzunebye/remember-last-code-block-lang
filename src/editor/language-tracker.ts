import { EditorView, ViewUpdate } from '@codemirror/view';
import type RememberCodeBlockLangPlugin from '../main';
import { normalizeLanguageIdentifier } from '../utils/language-identifier';

// Debounce helper
function debounce<T extends (...args: unknown[]) => void>(
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
    let pendingLineNumber: number | null = null;
    const debouncedSave = debounce(async (language: string) => {
        if (language !== plugin.settings.lastUsedLanguage) {
            plugin.settings.lastUsedLanguage = language;
            await plugin.saveSettings();
        }
    }, 300);

    return EditorView.updateListener.of((update: ViewUpdate) => {
        if (!update.docChanged && !update.selectionSet) {
            return;
        }

        const doc = update.state.doc;
        if (update.docChanged) {
            update.changes.iterChanges((_fromA, _toA, fromB, toB) => {
                const startLine = doc.lineAt(fromB);
                const endLine = doc.lineAt(Math.min(toB, doc.length));

                for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
                    if (/^\s*`{3,}/.test(doc.line(lineNum).text)) {
                        pendingLineNumber = lineNum;
                    }
                }
            });
        }

        if (pendingLineNumber === null) {
            return;
        }

        const cursorLine = doc.lineAt(update.state.selection.main.head).number;
        if (cursorLine === pendingLineNumber) {
            return;
        }

        const line = doc.line(Math.min(pendingLineNumber, doc.lines));
        const match = line.text.trim().match(/^`{3,}([^\s`]+)?\s*$/);
        pendingLineNumber = null;
        if (match) {
            debouncedSave(match[1] ? normalizeLanguageIdentifier(match[1]) : '');
        }
    });
}



