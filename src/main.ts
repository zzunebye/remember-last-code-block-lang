import { Editor, MarkdownView, Plugin } from 'obsidian';
import { RememberCodeBlockLangSettings, DEFAULT_SETTINGS } from './settings';
import { RememberCodeBlockLangSettingTab } from './settings-tab';
import { createRememberCodeBlockLangExtension } from './editor/extension';
import { processPlainCodeBlocks } from './utils/code-block-processor';
import { registerCodeBlockLanguageCommands } from './commands/code-block-language';

export default class RememberCodeBlockLangPlugin extends Plugin {
    settings: RememberCodeBlockLangSettings;

    async onload() {
        await this.loadSettings();

        // Register the CodeMirror 6 extension
        this.registerEditorExtension(createRememberCodeBlockLangExtension(this));
        registerCodeBlockLanguageCommands(this);

        // Add command to insert a code block with the remembered language
        this.addCommand({
            id: 'insert-code-block',
            name: 'Insert code block',
            editorCallback: (editor: Editor, _view: MarkdownView) => {
                const language = this.settings.lastUsedLanguage || this.settings.defaultLanguage;
                const selectedText = editor.getSelection();

                if (selectedText) {
                    // If there's selected text, wrap it in a code block
                    const codeBlock = `\`\`\`${language}\n${selectedText}\n\`\`\``;
                    editor.replaceSelection(codeBlock);
                } else {
                    // If no selection, insert an empty code block
                    const cursor = editor.getCursor();
                    const codeBlock = `\`\`\`${language}\n\n\`\`\``;
                    editor.replaceRange(codeBlock, cursor);

                    // Position cursor inside the code block (after the opening line)
                    const newLine = cursor.line + 1;
                    editor.setCursor({ line: newLine, ch: 0 });
                }
            }
        });

        // Add command to add default language to plain code blocks
        this.addCommand({
            id: 'add-default-language-to-plain-code-blocks',
            name: 'Add the default language to plain code block',
            editorCallback: (editor: Editor, _view: MarkdownView) => {
                // Get current content
                const content = editor.getValue();

                // Get language settings
                const lastUsedLanguage = this.settings.lastUsedLanguage;
                const defaultLanguage = this.settings.defaultLanguage;

                // Process the content
                const processedContent = processPlainCodeBlocks(
                    content,
                    lastUsedLanguage,
                    defaultLanguage
                );

                // Only update if content changed
                if (processedContent !== content) {
                    // Save cursor position
                    const cursor = editor.getCursor();

                    // Replace content
                    editor.setValue(processedContent);

                    // Restore cursor position (if still valid)
                    const lineCount = editor.lineCount();
                    if (cursor.line < lineCount) {
                        editor.setCursor(cursor);
                    }
                }
            }
        });

        // Add settings tab
        this.addSettingTab(new RememberCodeBlockLangSettingTab(this.app, this));
    }

    onunload() {
        // Cleanup is handled automatically by registerEditorExtension
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}



