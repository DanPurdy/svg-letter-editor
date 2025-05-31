import { CsvRecord } from "@components/svg-letter-editor";

const replaceTemplates = (text: string, data: CsvRecord): string => {
    if (!data) return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (match: string, key: string) => {
        return data[key] || match;
    });
};

const wrapText = (
    text: string,
    maxWidth: number,
    fontSize: number = 16,
): string[] => {
    // Character width calculation for proper line wrapping
    const charWidth: number = fontSize * 0.35;
    const maxCharsPerLine: number = Math.floor(maxWidth / charWidth);

    if (text.length <= maxCharsPerLine) return [text];

    const words: string[] = text.split(" ");
    const lines: string[] = [];
    let currentLine: string = "";

    for (const word of words) {
        const testLine: string = currentLine ? `${currentLine} ${word}` : word;

        if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                // Handle very long words that exceed line width
                let remainingWord: string = word;
                while (remainingWord.length > maxCharsPerLine) {
                    lines.push(
                        remainingWord.substring(0, maxCharsPerLine - 1) + "-",
                    );
                    remainingWord = remainingWord.substring(
                        maxCharsPerLine - 1,
                    );
                }
                currentLine = remainingWord;
            }
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
};

export const formatText = (
    text: string,
    data: CsvRecord,
    section: string = "body",
    width: number,
): string[] => {
    const replaced: string = replaceTemplates(text, data);
    const lines: string[] = replaced.split("\n");
    const wrappedLines: string[] = [];

    const margins = { left: 60, right: 60 };
    const maxWidths: Record<string, number> = {
        topLeft: width * 0.5 - margins.left, // Half-width for top sections to prevent overlap
        topRight: width * 0.5 - margins.right,
        body: width - margins.left - margins.right, // Full width minus margins for body
    };

    const maxWidth: number = maxWidths[section] || maxWidths.body;

    for (const line of lines) {
        if (line.trim() === "") {
            wrappedLines.push(""); // Preserve empty lines
        } else {
            const wrapped: string[] = wrapText(line, maxWidth);
            wrappedLines.push(...wrapped);
        }
    }

    return wrappedLines;
};
