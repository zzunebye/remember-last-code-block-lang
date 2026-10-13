import { App, Modal, Notice } from 'obsidian';
import type { Editor, MarkdownView, Plugin } from 'obsidian';
import { processCodeBlocksWithLanguage } from '../utils/code-block-processor';

class LanguageInputModal extends Modal {
    constructor(app: App, private readonly onSubmit: (language: string) => void) {
        super(app);
    }

    onOpen(): void {
        this.setTitle('Set language for plain code blocks');

        const form = this.contentEl.createEl('form');
        form.createEl('label', { text: 'Language', attr: { for: 'code-block-language' } });
        const input = form.createEl('input', {
            type: 'text',
            attr: { id: 'code-block-language', autocomplete: 'off', placeholder: 'e.g. typescript' }
        });
        input.focus();
        form.createEl('button', { type: 'submit', text: 'Apply' });
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const language = input.value.trim();
            if (!language) {
                new Notice('Enter a language.');
                return;
            }
            this.onSubmit(language);
            this.close();
        });
    }

    onClose(): void {
        this.contentEl.empty();
    }
}

function applyLanguage(editor: Editor, language: string): void {
    const content = editor.getValue();
    const result = processCodeBlocksWithLanguage(content, language);
    if (result.updatedBlocks === 0) {
        new Notice('No code blocks without a language were found.');
        return;
    }

    const cursor = editor.getCursor();
    const lastLine = editor.lastLine();
    editor.replaceRange(
        result.content,
        { line: 0, ch: 0 },
        { line: lastLine, ch: editor.getLine(lastLine).length }
    );
    if (cursor.line < editor.lineCount()) {
        editor.setCursor(cursor);
    }
    new Notice(`Set the language for ${result.updatedBlocks} code block${result.updatedBlocks === 1 ? '' : 's'}.`);
}

export function registerCodeBlockLanguageCommands(plugin: Plugin): void {
    plugin.addCommand({
        id: 'set-language-for-plain-code-blocks',
        name: 'Set language for plain code blocks',
        editorCallback: (editor: Editor, _view: MarkdownView) => {
            const modal = new LanguageInputModal(plugin.app, (language) => applyLanguage(editor, language));
            plugin.register(() => modal.close());
            modal.open();
        }
    });

    plugin.addCommand({
        id: 'set-language-for-code-blocks-without-language-from-selection',
        name: 'Set language for code blocks without a language from selection',
        editorCallback: (editor: Editor, _view: MarkdownView) => {
            const language = editor.getSelection().trim();
            if (!language || /\r?\n/.test(language)) {
                new Notice('Select a single-line language name first.');
                return;
            }
            applyLanguage(editor, language);
        }
    });
}
