import { App, PluginSettingTab, Setting } from 'obsidian';
import type RememberCodeBlockLangPlugin from './main';

export class RememberCodeBlockLangSettingTab extends PluginSettingTab {
    plugin: RememberCodeBlockLangPlugin;

    constructor(app: App, plugin: RememberCodeBlockLangPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Remember Code Block Language Settings' });

        new Setting(containerEl)
            .setName('Enable auto-injection')
            .setDesc('Automatically insert the last used language when typing ``` to create a code block')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.autoInjectEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.autoInjectEnabled = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Default language')
            .setDesc('Default language to use when no previous language is remembered (optional)')
            .addText(text => text
                .setPlaceholder('e.g., javascript')
                .setValue(this.plugin.settings.defaultLanguage)
                .onChange(async (value) => {
                    this.plugin.settings.defaultLanguage = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Last used language')
            .setDesc('The language that was most recently used (automatically updated)')
            .addText(text => text
                .setValue(this.plugin.settings.lastUsedLanguage)
                .setDisabled(true));
    }
}



