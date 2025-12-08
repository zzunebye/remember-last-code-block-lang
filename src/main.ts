import { Editor, MarkdownView, Plugin } from 'obsidian';
import { RememberCodeBlockLangSettings, DEFAULT_SETTINGS } from './settings';
import { RememberCodeBlockLangSettingTab } from './settings-tab';
import { createRememberCodeBlockLangExtension } from './editor/extension';

export default class RememberCodeBlockLangPlugin extends Plugin {
    settings: RememberCodeBlockLangSettings;

    async onload() {
        await this.loadSettings();

        // Register the CodeMirror 6 extension
        this.registerEditorExtension(createRememberCodeBlockLangExtension(this));

        // Add command to insert a code block with the remembered language
        this.addCommand({
            id: 'insert-code-block',
            name: 'Insert code block',
            editorCallback: (editor: Editor, _view: MarkdownView) => {
                const language = this.settings.lastUsedLanguage || this.settings.defaultLanguage;
                const cursor = editor.getCursor();

                // Insert code block with language
                const codeBlock = `\`\`\`${language}\n\n\`\`\``;
                editor.replaceRange(codeBlock, cursor);

                // Position cursor inside the code block (after the opening line)
                const newLine = cursor.line + 1;
                editor.setCursor({ line: newLine, ch: 0 });
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

