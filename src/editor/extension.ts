import { Extension } from '@codemirror/state';
import { createBacktickHandler } from './backtick-handler';
import { createLanguageTracker } from './language-tracker';
import type RememberCodeBlockLangPlugin from '../main';

export function createRememberCodeBlockLangExtension(plugin: RememberCodeBlockLangPlugin): Extension[] {
    return [
        createBacktickHandler(plugin),
        createLanguageTracker(plugin)
    ];
}

