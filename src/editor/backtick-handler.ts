import { EditorView } from '@codemirror/view';
import { EditorSelection } from '@codemirror/state';
import type RememberCodeBlockLangPlugin from '../main';

export function createBacktickHandler(plugin: RememberCodeBlockLangPlugin) {
    return EditorView.domEventHandlers({
        beforeinput(event, view) {
            // Only handle when auto-inject is enabled
            if (!plugin.settings.autoInjectEnabled) {
                return false;
            }

            // Check if the input is a backtick
            if (event.data !== '`') {
                return false;
            }

            const { state } = view;
            const { from } = state.selection.main;

            // Get the line content before the cursor
            const line = state.doc.lineAt(from);
            const lineText = line.text;
            const cursorPosInLine = from - line.from;
            const textBeforeCursor = lineText.slice(0, cursorPosInLine);

            // Check if we're about to complete a ``` pattern at the start of the line
            // The pattern should be "``" (two backticks) with only whitespace before it
            if (/^\s*``$/.test(textBeforeCursor)) {
                // Get the language to inject
                const language = plugin.settings.lastUsedLanguage || plugin.settings.defaultLanguage;

                if (language) {
                    // Allow the default backtick to be inserted, then inject the language
                    setTimeout(() => {
                        const currentState = view.state;
                        const currentPos = currentState.selection.main.from;

                        // Insert the language after the third backtick
                        view.dispatch({
                            changes: {
                                from: currentPos,
                                to: currentPos,
                                insert: language
                            },
                            selection: EditorSelection.cursor(currentPos + language.length)
                        });
                    }, 0);
                }
            }

            return false; // Let the default backtick insertion happen
        }
    });
}



