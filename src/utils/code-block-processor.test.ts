import { processPlainCodeBlocks } from './code-block-processor';

describe('processPlainCodeBlocks', () => {
    describe('Language Priority', () => {
        const content = '```\ncode here\n```';

        test('should use lastUsedLanguage when available', () => {
            const result = processPlainCodeBlocks(content, 'python', 'javascript');
            expect(result).toBe('```python\ncode here\n```');
        });

        test('should use defaultLanguage when lastUsedLanguage is empty', () => {
            const result = processPlainCodeBlocks(content, '', 'javascript');
            expect(result).toBe('```javascript\ncode here\n```');
        });

        test('should use "text" fallback when both are empty', () => {
            const result = processPlainCodeBlocks(content, '', '');
            expect(result).toBe('```text\ncode here\n```');
        });

        test('should use defaultLanguage when lastUsedLanguage is whitespace only', () => {
            const result = processPlainCodeBlocks(content, '   ', 'javascript');
            expect(result).toBe('```   \ncode here\n```');
        });
    });

    describe('Plain Code Blocks', () => {
        test('should add language to single plain code block', () => {
            const content = '```\nx = 1\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\nx = 1\n```');
        });

        test('should add language to multiple plain code blocks', () => {
            const content = '```\ncode1\n```\n\ntext\n\n```\ncode2\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\ncode1\n```\n\ntext\n\n```python\ncode2\n```');
        });

        test('should handle plain code block with multiple lines', () => {
            const content = '```\nline1\nline2\nline3\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\nline1\nline2\nline3\n```');
        });

        test('should handle empty plain code block', () => {
            const content = '```\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\n```');
        });

        test('should handle plain code block at start of document', () => {
            const content = '```\ncode\n```\n\nSome text after';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\ncode\n```\n\nSome text after');
        });

        test('should handle plain code block at end of document', () => {
            const content = 'Some text before\n\n```\ncode\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('Some text before\n\n```python\ncode\n```');
        });
    });

    describe('Code Blocks with Language', () => {
        test('should not modify code block with language identifier', () => {
            const content = '```javascript\nconsole.log("hello");\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```javascript\nconsole.log("hello");\n```');
        });

        test('should not modify code block with different language', () => {
            const content = '```typescript\nconst x: number = 1;\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```typescript\nconst x: number = 1;\n```');
        });

        test('should handle mixed plain and language code blocks', () => {
            const content = '```\nplain\n```\n\n```python\nwith language\n```\n\n```\nplain again\n```';
            const result = processPlainCodeBlocks(content, 'javascript', '');
            expect(result).toBe('```javascript\nplain\n```\n\n```python\nwith language\n```\n\n```javascript\nplain again\n```');
        });
    });

    describe('Indentation and Whitespace', () => {
        test('should preserve leading whitespace before backticks', () => {
            const content = '  ```\n  code\n  ```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('  ```python\n  code\n  ```');
        });

        test('should handle tabs as leading whitespace', () => {
            const content = '\t```\n\tcode\n\t```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('\t```python\n\tcode\n\t```');
        });

        test('should handle plain code block with whitespace after backticks', () => {
            const content = '```  \ncode\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\ncode\n```');
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty document', () => {
            const content = '';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('');
        });

        test('should handle document with only text, no code blocks', () => {
            const content = 'Just some text\nwith multiple lines\nand no code blocks';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe(content);
        });

        test('should add language to unclosed code block (it is still an opening)', () => {
            // An unclosed code block is still a valid opening - it just doesn't have a closing yet
            const content = '```\ncode without closing';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\ncode without closing');
        });

        test('should handle consecutive code blocks', () => {
            const content = '```\ncode1\n```\n```\ncode2\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\ncode1\n```\n```python\ncode2\n```');
        });

        test('should handle code block with backticks in content', () => {
            const content = '```\nHere is a `backtick` in content\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\nHere is a `backtick` in content\n```');
        });

        test('should not be confused by single or double backticks', () => {
            const content = 'Some `inline code` and ``double`` backticks\n```\nreal code block\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('Some `inline code` and ``double`` backticks\n```python\nreal code block\n```');
        });

        test('should handle code block with only newlines', () => {
            const content = '```\n\n\n\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\n\n\n\n```');
        });
    });

    describe('Real-world Examples', () => {
        test('should handle markdown document with mixed content', () => {
            const content = `# Title

Some text here.

\`\`\`
x = y + 2
print(x)
\`\`\`

More text.

\`\`\`javascript
const z = 10;
\`\`\`

Final paragraph.

\`\`\`
SELECT * FROM users;
\`\`\``;

            const expected = `# Title

Some text here.

\`\`\`python
x = y + 2
print(x)
\`\`\`

More text.

\`\`\`javascript
const z = 10;
\`\`\`

Final paragraph.

\`\`\`python
SELECT * FROM users;
\`\`\``;

            const result = processPlainCodeBlocks(content, 'python', 'javascript');
            expect(result).toBe(expected);
        });

        test('should handle nested lists with code blocks', () => {
            const content = `- Item 1
  \`\`\`
  code here
  \`\`\`
- Item 2
  - Nested
    \`\`\`
    more code
    \`\`\``;

            const expected = `- Item 1
  \`\`\`python
  code here
  \`\`\`
- Item 2
  - Nested
    \`\`\`python
    more code
    \`\`\``;

            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe(expected);
        });

        test('should handle Korean text with multiple code blocks', () => {
            const content = `\`\`\`
(ns myns
  (:use colors))

(hex->rgb "#33d24f")
\`\`\`

이 방식에는 단점이 두 가지 있습니다.

1. 함수가 원래 어디에서 정의됐는지 알기 어려워 코드 탐색이 힘들고,
2. 같은 이름의 함수를 가진 네임스페이스를 둘 이상 \`:use\`하면 충돌로 에러가 납니다.

첫 번째 문제는 :use에서 :only로 사용할 것만 명시해 해결할 수 있습니다.

\`\`\`
(ns myns
  (:use [colors :only [rgb->hex]]))

(defn hex-str [c]
  (println "I don't do much yet"))
\`\`\``;

            const expected = `\`\`\`python
(ns myns
  (:use colors))

(hex->rgb "#33d24f")
\`\`\`

이 방식에는 단점이 두 가지 있습니다.

1. 함수가 원래 어디에서 정의됐는지 알기 어려워 코드 탐색이 힘들고,
2. 같은 이름의 함수를 가진 네임스페이스를 둘 이상 \`:use\`하면 충돌로 에러가 납니다.

첫 번째 문제는 :use에서 :only로 사용할 것만 명시해 해결할 수 있습니다.

\`\`\`python
(ns myns
  (:use [colors :only [rgb->hex]]))

(defn hex-str [c]
  (println "I don't do much yet"))
\`\`\``;

            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe(expected);
        });
    });

    describe('No Changes Needed', () => {
        test('should return same content if no plain code blocks exist', () => {
            const content = `# Document

Some text.

\`\`\`python
code
\`\`\`

\`\`\`javascript
more code
\`\`\``;

            const result = processPlainCodeBlocks(content, 'typescript', '');
            expect(result).toBe(content);
        });
    });

    describe('Malformed Documents (Robust Handling)', () => {
        test('should NOT add language to closing markers (odd-even rule)', () => {
            // Key: 1st ``` = opening, 2nd ``` = closing, 3rd ``` = opening (new block)
            const content = 'Some text\n```\nThis looks like code\n```\nMore text\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            // Line 2: opening (gets lang), Line 4: closing (no lang), Line 6: new opening (gets lang)
            expect(result).toBe('Some text\n```python\nThis looks like code\n```\nMore text\n```python');
        });

        test('should handle odd number of markers - 3 markers', () => {
            // With 3 markers: 1st=opening, 2nd=closing, 3rd=new opening
            const content = '```\ncode1\n```\n```\norphan';
            const result = processPlainCodeBlocks(content, 'python', '');
            // 1st gets lang, 2nd is closing, 3rd is new opening (gets lang)
            expect(result).toBe('```python\ncode1\n```\n```python\norphan');
        });

        test('should handle odd number of markers - 5 markers', () => {
            // 5 markers: 1st=open, 2nd=close, 3rd=open, 4th=close, 5th=open
            const content = '```\ncode1\n```\n```\ncode2\n```\n```\norphan';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\ncode1\n```\n```python\ncode2\n```\n```python\norphan');
        });

        test('should handle document with proper odd-even pairing', () => {
            const content = `Text before

\`\`\`
valid code block
\`\`\`

Text in middle

\`\`\`
another valid block
\`\`\`

\`\`\`
unclosed block at end`;

            const expected = `Text before

\`\`\`python
valid code block
\`\`\`

Text in middle

\`\`\`python
another valid block
\`\`\`

\`\`\`python
unclosed block at end`;

            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe(expected);
        });

        test('should NOT add language to closing markers even if they look like openings', () => {
            // The closing ``` should never get language added
            const content = '```python\ncode\n```';
            const result = processPlainCodeBlocks(content, 'javascript', '');
            // The closing ``` should remain unchanged
            expect(result).toBe('```python\ncode\n```');
        });

        test('should add language to opening even without closing (it is still an opening)', () => {
            // Single marker at the beginning - it's an opening
            const content = '```\nstart of code\nno closing';
            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe('```python\nstart of code\nno closing');
        });

        test('should handle alternating open-close pattern', () => {
            // 3 markers: open, close, open (the new state machine handles this correctly)
            const content = '```\n```\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            // 1st=open (lang), 2nd=close (no lang), 3rd=open (lang)
            expect(result).toBe('```python\n```\n```python');
        });

        test('should handle closing marker that has content after backticks', () => {
            // ```something after backticks is treated as having a "language"
            const content = '```\ncode\n```something';
            const result = processPlainCodeBlocks(content, 'python', '');
            // The opening gets language, ```something is treated as closing (it has content after ```)
            expect(result).toBe('```python\ncode\n```something');
        });

        test('should correctly handle complex document with odd-even logic', () => {
            const content = `# Header

\`\`\`
block 1
\`\`\`

Some text with \`inline\` code.

\`\`\`javascript
block 2 with lang
\`\`\`

\`\`\`
block 3
\`\`\`

Unclosed:
\`\`\`
no closing`;

            const expected = `# Header

\`\`\`python
block 1
\`\`\`

Some text with \`inline\` code.

\`\`\`javascript
block 2 with lang
\`\`\`

\`\`\`python
block 3
\`\`\`

Unclosed:
\`\`\`python
no closing`;

            const result = processPlainCodeBlocks(content, 'python', '');
            expect(result).toBe(expected);
        });

        test('should NEVER add language to even-positioned markers (closings)', () => {
            // Explicit test: even positions in sequence are always closings
            const content = '```\nA\n```\n```\nB\n```\n```\nC\n```';
            const result = processPlainCodeBlocks(content, 'python', '');
            // Positions: 0=open, 1=close, 2=open, 3=close, 4=open, 5=close
            expect(result).toBe('```python\nA\n```\n```python\nB\n```\n```python\nC\n```');
            // Verify closings (```) don't have language
            const lines = result.split('\n');
            expect(lines[2]).toBe('```');  // 1st closing
            expect(lines[5]).toBe('```');  // 2nd closing
            expect(lines[8]).toBe('```');  // 3rd closing
        });
    });
});

