"use client";
import React, { useState, ChangeEvent } from 'react';
import { Download, FileText } from 'lucide-react';

// Type definitions
interface PaperDimensions {
    width: number;
    height: number;
}

interface LetterData {
    topLeft: string;
    topRight: string;
    body: string;
}

interface CsvRecord {
    [key: string]: string;
}

interface PaperSizes {
    A4: PaperDimensions;
    A5Portrait: PaperDimensions;
    A5Landscape: PaperDimensions;
    A6Portrait: PaperDimensions;
    A6Landscape: PaperDimensions;
}

type PaperSize = keyof PaperSizes;
type LetterSection = keyof LetterData;

export default function LetterGenerator() {
    const [paperSize, setPaperSize] = useState<PaperSize>('A4');
    const [letterData, setLetterData] = useState<LetterData>({
        topLeft: '{{company_name}}\n{{address_line_1}}\n{{address_line_2}}\n{{city}}, {{county}} {{postcode}}',
        topRight: '{{date}}\n{{reference_number}}',
        body: 'Dear {{recipient_name}},\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nThank you for your continued business.\n\nBest regards,\nSteve\nMogul in Charge\nPenned',
    });

    // Paper dimensions in pixels (at 96 DPI)
    const paperDimensions: PaperSizes = {
        A4: { width: 794, height: 1123 },
        A5Portrait: { width: 559, height: 794 },
        A5Landscape: { width: 794, height: 559 },
        A6Portrait: { width: 397, height: 559 },
        A6Landscape: { width: 559, height: 397}
    };

    const wrapText = (text: string, maxWidth: number, fontSize: number = 16): string[] => {
        // Character width calculation for proper line wrapping
        const charWidth: number = fontSize * 0.35;
        const maxCharsPerLine: number = Math.floor(maxWidth / charWidth);

        if (text.length <= maxCharsPerLine) return [text];

        const words: string[] = text.split(' ');
        const lines: string[] = [];
        let currentLine: string = '';

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
                        lines.push(remainingWord.substring(0, maxCharsPerLine - 1) + '-');
                        remainingWord = remainingWord.substring(maxCharsPerLine - 1);
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

    const handleInputChange = (field: LetterSection, value: string): void => {
        setLetterData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const replaceTemplates = (text: string, data: CsvRecord): string => {
        if (!data) return text;
        return text.replace(/\{\{([^}]+)\}\}/g, (match: string, key: string) => {
            return data[key] || match;
        });
    };

    const formatText = (text: string, data: CsvRecord, section: string = 'body'): string[] => {
        const replaced: string = replaceTemplates(text, data);
        const lines: string[] = replaced.split('\n');
        const wrappedLines: string[] = [];

        // Define max widths for different sections (accounting for margins)
        const { width }: PaperDimensions = paperDimensions[paperSize];
        const margins = { left: 60, right: 60 };
        const maxWidths: Record<string, number> = {
            topLeft: width * 0.5 - margins.left, // Half-width for top sections to prevent overlap
            topRight: width * 0.5 - margins.right,
            body: width - margins.left - margins.right, // Full width minus margins for body
        };

        const maxWidth: number = maxWidths[section] || maxWidths.body;

        for (const line of lines) {
            if (line.trim() === '') {
                wrappedLines.push(''); // Preserve empty lines
            } else {
                const wrapped: string[] = wrapText(line, maxWidth);
                wrappedLines.push(...wrapped);
            }
        }

        return wrappedLines;
    };

    const generateSVGString = (): string => {
        const { width, height }: PaperDimensions = paperDimensions[paperSize];

        const topLeftLines: string[] = formatText(letterData.topLeft, currentData, 'topLeft');
        const topRightLines: string[] = formatText(letterData.topRight, currentData, 'topRight');
        const bodyLines: string[] = formatText(letterData.body, currentData, 'body');

        const escapeXml = (text: string): string => {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- White background -->
  <rect width="${width}" height="${height}" fill="white"/>
  
  <!-- Top Left -->
  <g id="top-left">
${topLeftLines.map((line: string, index: number) =>
            `    <text x="60" y="${80 + index * 24}" font-size="16" font-family="Brush Script MT, cursive" fill="#333">${escapeXml(line)}</text>`
        ).join('\n')}
  </g>

  <!-- Top Right -->
  <g id="top-right">
${topRightLines.map((line: string, index: number) =>
            `    <text x="${width - 60}" y="${80 + index * 24}" font-size="16" font-family="Brush Script MT, cursive" fill="#333" text-anchor="end">${escapeXml(line)}</text>`
        ).join('\n')}
  </g>

  <!-- Body -->
  <g id="body">
${bodyLines.map((line: string, index: number) =>
            `    <text x="60" y="${250 + index * 26}" font-size="16" font-family="Brush Script MT, cursive" fill="#333">${escapeXml(line)}</text>`
        ).join('\n')}
  </g>
</svg>`;
    };

    const downloadSVG = (): void => {
        // @Steve you can change this to just be a save button that then sends the file to you or whatever. Can easily add some sort of bucket drop for it
        try {
            const svgString: string = generateSVGString();

            const blob: Blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url: string = URL.createObjectURL(blob);

            const link: HTMLAnchorElement = document.createElement('a');
            link.href = url;
            link.download = `letter-${paperSize}-record.svg`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error(error);
            alert('Download failed. Please try again.');
        }
    };

    const { width, height }: PaperDimensions = paperDimensions[paperSize];
    const scale: number = Math.min(600 / width, 700 / height); // Dynamic scale based on paper size
    const currentData: CsvRecord = {};

    return (
        <div className="mx-auto p-6 bg-gray-50 min-h-screen text-gray-800">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Letter Template Generator</h1>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                        {/* Paper Size and CSV Upload */}
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Paper Size
                                </label>
                                <select
                                    value={paperSize}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setPaperSize(e.target.value as PaperSize)}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="A4">A4 (210 × 297 mm)</option>
                                    <option value="A5Portrait">A5 Portrait (148 × 210 mm)</option>
                                    <option value="A5Landscape">A5 Landscape (210 mm x 148mm)</option>
                                    <option value="A6Portrait">A6 Portrait (105mm × 148 mm)</option>
                                    <option value="A6Landscape">A6 Landscape (148 mm x 105mm)</option>
                                </select>
                            </div>
                        </div>

                        {/* Text Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Top Left (Header)
                                </label>
                                <textarea
                                    value={letterData.topLeft}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('topLeft', e.target.value)}
                                    className="w-full h-24 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Company info, address..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Top Right (Date, Reference)
                                </label>
                                <textarea
                                    value={letterData.topRight}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('topRight', e.target.value)}
                                    className="w-full h-20 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Date, reference number..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Body Text
                                </label>
                                <textarea
                                    value={letterData.body}
                                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('body', e.target.value)}
                                    className="w-full h-32 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Dear {{name}}, main content..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={downloadSVG}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <Download className="w-4 h-4" />
                            Download SVG
                        </button>
                    </div>

                    {/* Visual Preview */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Visual Preview</h3>
                            <div className="text-right">
                <span className="text-sm text-gray-600 block">
                  Preview: {Math.round(width * scale)} × {Math.round(height * scale)}px
                </span>
                                <span className="text-xs text-gray-500">
                  Download: {width} × {height}px ({paperSize})
                </span>
                            </div>
                        </div>

                        <div
                            className="bg-white shadow-lg mx-auto border"
                            style={{
                                width: width * scale,
                                height: height * scale,
                                maxHeight: '700px',
                                overflow: 'auto'
                            }}
                        >
                            <svg
                                id="letter-svg"
                                width={width * scale}
                                height={height * scale}
                                viewBox={`0 0 ${width} ${height}`}
                                className="w-full h-full"
                            >
                                {/* White background */}
                                <rect width={width} height={height} fill="white" />

                                {/* Top Left */}
                                <g>
                                    {formatText(letterData.topLeft, currentData, 'topLeft').map((line: string, index: number) => (
                                        <text
                                            key={`tl-${index}`}
                                            x="60"
                                            y={80 + index * 24}
                                            fontSize="16"
                                            fontFamily="Brush Script MT, cursive"
                                            fill="#333"
                                        >
                                            {line}
                                        </text>
                                    ))}
                                </g>

                                {/* Top Right */}
                                <g>
                                    {formatText(letterData.topRight, currentData, 'topRight').map((line: string, index: number) => (
                                        <text
                                            key={`tr-${index}`}
                                            x={width - 60}
                                            y={80 + index * 24}
                                            fontSize="16"
                                            fontFamily="Brush Script MT, cursive"
                                            fill="#333"
                                            textAnchor="end"
                                        >
                                            {line}
                                        </text>
                                    ))}
                                </g>

                                {/* Body */}
                                <g>
                                    {formatText(letterData.body, currentData, 'body').map((line: string, index: number) => (
                                        <text
                                            key={`body-${index}`}
                                            x="60"
                                            y={250 + index * 26}
                                            fontSize="16"
                                            fontFamily="Brush Script MT, cursive"
                                            fill="#333"
                                        >
                                            {line}
                                        </text>
                                    ))}
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}