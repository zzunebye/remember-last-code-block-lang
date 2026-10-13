export function normalizeLanguageIdentifier(language: string): string {
    return /^c\+\+$/i.test(language.trim()) ? 'cpp' : language;
}
