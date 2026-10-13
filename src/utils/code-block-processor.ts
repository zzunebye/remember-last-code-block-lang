import { normalizeLanguageIdentifier } from './language-identifier';

export function processPlainCodeBlocks(
    content: string,
    lastUsedLanguage: string,
    defaultLanguage: string
): string {
    // Determine the language to use based on priority
    const languageToUse = lastUsedLanguage || defaultLanguage || 'text';

    return processCodeBlocksWithLanguage(content, languageToUse).content;
}

export interface ProcessedCodeBlocks {
    readonly content: string;
    readonly updatedBlocks: number;
}

export function processCodeBlocksWithLanguage(
    content: string,
    language: string
): ProcessedCodeBlocks {
    const languageIdentifier = normalizeLanguageIdentifier(language);
    const lines = content.split('\n');
    const result: string[] = [];
    let fence: { character: string; length: number } | null = null;
    let updatedBlocks = 0;

    for (const line of lines) {
        const opening = line.match(/^([ \t]*)(`{3,}|~{3,})(.*)$/);
        if (fence) {
            result.push(line);
            const closing = line.match(/^([ \t]*)(`+|~+)[ \t]*$/);
            if (closing && closing[2][0] === fence.character && closing[2].length >= fence.length) {
                fence = null;
            }
            continue;
        }

        if (!opening) {
            result.push(line);
            continue;
        }

        const [, indent, marker, info] = opening;
        fence = { character: marker[0], length: marker.length };
        if (info.trim() === '') {
            result.push(`${indent}${marker}${languageIdentifier}`);
            updatedBlocks++;
        } else {
            result.push(line);
        }
    }

    return { content: result.join('\n'), updatedBlocks };
}

