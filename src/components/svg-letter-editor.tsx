
"use client";
import React, { useState, ChangeEvent, useMemo, useRef, useCallback } from 'react';
import { Download, FileText, Table, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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

// Configuration for which fields are available for each paper type
const paperTypeConfig = {
    A4: {
        fields: ['topLeft', 'topRight', 'body'] as LetterSection[],
        bodyStartY: 250,
        description: 'Full letter format with header and body',
        maxCharacters: {
            topLeft: 300,
            topRight: 150,
            body: 2500
        }
    },
    A5Portrait: {
        fields: ['body'] as LetterSection[],
        bodyStartY: 80,
        description: 'Body text only format',
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 1800
        }
    },
    A5Landscape: {
        fields: ['body'] as LetterSection[],
        bodyStartY: 80,
        description: 'Body text only format',
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 1200
        }
    },
    A6Portrait: {
        fields: ['body'] as LetterSection[],
        bodyStartY: 80,
        description: 'Body text only format',
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 1000
        }
    },
    A6Landscape: {
        fields: ['body'] as LetterSection[],
        bodyStartY: 80,
        description: 'Body text only format',
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 600
        }
    }
};

export default function LetterGenerator() {
    const [paperSize, setPaperSize] = useState<PaperSize>('A4');
    const [letterData, setLetterData] = useState<LetterData>({
        topLeft: '{{company_name}}\n{{address_line_1}}\n{{address_line_2}}\n{{city}}, {{county}} {{postcode}}',
        topRight: '{{date}}\n{{reference_number}}',
        body: 'Dear {{recipient_name}},\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nThank you for your continued business.\n\nBest regards,\nSteve\nMogul in Charge\nPenned',
    });

    // Preview zoom and pan state
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({x: 0, y: 0});
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({x: 0, y: 0});
    const previewContainerRef = useRef<HTMLDivElement>(null);

    // Paper dimensions in pixels (at 96 DPI)
    const paperDimensions: PaperSizes = {
        A4: {width: 794, height: 1123},
        A5Portrait: {width: 559, height: 794},
        A5Landscape: {width: 794, height: 559},
        A6Portrait: {width: 397, height: 559},
        A6Landscape: {width: 559, height: 397}
    };

    // Get current paper configuration
    const currentConfig = paperTypeConfig[paperSize];

    // Extract template tags from all active fields
    const templateTags = useMemo(() => {
        const tags = new Set<string>();
        const templateRegex = /\{\{([^}]+)\}\}/g;

        // Only extract tags from fields that are active for the current paper type
        currentConfig.fields.forEach(field => {
            const text = letterData[field];
            let match;
            while ((match = templateRegex.exec(text)) !== null) {
                tags.add(match[1].trim());
            }
        });

        return Array.from(tags).sort();
    }, [letterData, currentConfig.fields]);

    // Reset zoom and pan when paper size changes
    React.useEffect(() => {
        setZoomLevel(1);
        setPanOffset({x: 0, y: 0});
    }, [paperSize]);

    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev * 1.2, 3)); // Max zoom 3x
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev / 1.2, 0.3)); // Min zoom 0.3x
    }, []);

    const handleResetView = useCallback(() => {
        setZoomLevel(1);
        setPanOffset({x: 0, y: 0});
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (zoomLevel > 1) { // Only allow panning when zoomed in
            setIsPanning(true);
            setLastMousePos({x: e.clientX, y: e.clientY});
            e.preventDefault();
        }
    }, [zoomLevel]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning && zoomLevel > 1) {
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;

            setPanOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastMousePos({x: e.clientX, y: e.clientY});
        }
    }, [isPanning, lastMousePos, zoomLevel]);

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) { // Zoom with Ctrl/Cmd + scroll
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoomLevel(prev => Math.max(0.3, Math.min(3, prev * delta)));
        }
    }, []);

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
        const maxLength = currentConfig.maxCharacters[field];

        // Truncate the value if it exceeds the character limit
        const truncatedValue = maxLength > 0 ? value.slice(0, maxLength) : value;

        setLetterData(prev => ({
            ...prev,
            [field]: truncatedValue
        }));
    };

    const getCharacterCount = (field: LetterSection): number => {
        return letterData[field].length;
    };

    const getCharacterLimit = (field: LetterSection): number => {
        return currentConfig.maxCharacters[field];
    };

    const isNearLimit = (field: LetterSection): boolean => {
        const count = getCharacterCount(field);
        const limit = getCharacterLimit(field);
        return count > limit * 0.8; // Show warning when above 80% of limit
    };

    const isAtLimit = (field: LetterSection): boolean => {
        const count = getCharacterCount(field);
        const limit = getCharacterLimit(field);
        return count >= limit;
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
        const {width}: PaperDimensions = paperDimensions[paperSize];
        const margins = {left: 60, right: 60};
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
        const {width, height}: PaperDimensions = paperDimensions[paperSize];
        const config = paperTypeConfig[paperSize];

        const escapeXml = (text: string): string => {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        };

        let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- White background -->
  <rect width="${width}" height="${height}" fill="white"/>
  `;

        // Only include sections that are configured for this paper type
        if (config.fields.includes('topLeft')) {
            const topLeftLines: string[] = formatText(letterData.topLeft, currentData, 'topLeft');
            svgContent += `
  <!-- Top Left -->
  <g id="top-left">
${topLeftLines.map((line: string, index: number) =>
                `    <text x="60" y="${80 + index * 24}" font-size="16" font-family="Brush Script MT, cursive" fill="#333">${escapeXml(line)}</text>`
            ).join('\n')}
  </g>`;
        }

        if (config.fields.includes('topRight')) {
            const topRightLines: string[] = formatText(letterData.topRight, currentData, 'topRight');
            svgContent += `

  <!-- Top Right -->
  <g id="top-right">
${topRightLines.map((line: string, index: number) =>
                `    <text x="${width - 60}" y="${80 + index * 24}" font-size="16" font-family="Brush Script MT, cursive" fill="#333" text-anchor="end">${escapeXml(line)}</text>`
            ).join('\n')}
  </g>`;
        }

        if (config.fields.includes('body')) {
            const bodyLines: string[] = formatText(letterData.body, currentData, 'body');
            svgContent += `

  <!-- Body -->
  <g id="body">
${bodyLines.map((line: string, index: number) =>
                `    <text x="60" y="${config.bodyStartY + index * 26}" font-size="16" font-family="Brush Script MT, cursive" fill="#333">${escapeXml(line)}</text>`
            ).join('\n')}
  </g>`;
        }

        svgContent += `
</svg>`;

        return svgContent;
    };

    const downloadSVG = (): void => {
        try {
            const svgString: string = generateSVGString();

            const blob: Blob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
            const url: string = URL.createObjectURL(blob);

            const link: HTMLAnchorElement = document.createElement('a');
            link.href = url;
            link.download = `letter-${paperSize}-template.svg`;
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

    const downloadCSVTemplate = (): void => {
        try {
            if (templateTags.length === 0) {
                alert('No template tags found in the current document.');
                return;
            }

            // Create CSV content with headers
            const csvContent = templateTags.join(',') + '\n';

            const blob: Blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8'});
            const url: string = URL.createObjectURL(blob);

            const link: HTMLAnchorElement = document.createElement('a');
            link.href = url;
            link.download = `letter-template-${paperSize}.csv`;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error(error);
            alert('CSV download failed. Please try again.');
        }
    };

    const renderPreviewSections = () => {
        const config = paperTypeConfig[paperSize];
        const {width} = paperDimensions[paperSize];
        const sections = [];

        if (config.fields.includes('topLeft')) {
            sections.push(
                <g key="topLeft">
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
            );
        }

        if (config.fields.includes('topRight')) {
            sections.push(
                <g key="topRight">
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
            );
        }

        if (config.fields.includes('body')) {
            sections.push(
                <g key="body">
                    {formatText(letterData.body, currentData, 'body').map((line: string, index: number) => (
                        <text
                            key={`body-${index}`}
                            x="60"
                            y={config.bodyStartY + index * 26}
                            fontSize="16"
                            fontFamily="Brush Script MT, cursive"
                            fill="#333"
                        >
                            {line}
                        </text>
                    ))}
                </g>
            );
        }

        return sections;
    };

    const { width, height }: PaperDimensions = paperDimensions[paperSize];
    const currentData: CsvRecord = {};

    // Calculate container dimensions based on paper aspect ratio
    const maxContainerWidth = 600;
    const maxContainerHeight = 700;
    const paperAspectRatio = width / height;
    const containerAspectRatio = maxContainerWidth / maxContainerHeight;

    let containerWidth, containerHeight;

    if (paperAspectRatio > containerAspectRatio) {
        // Paper is wider than container ratio - fit to width
        containerWidth = maxContainerWidth;
        containerHeight = maxContainerWidth / paperAspectRatio;
    } else {
        // Paper is taller than container ratio - fit to height
        containerHeight = maxContainerHeight;
        containerWidth = maxContainerHeight * paperAspectRatio;
    }

    // Calculate base scale to fit paper in container with some padding
    const padding = 40; // 20px padding on each side
    const baseScale = Math.min(
        (containerWidth - padding) / width,
        (containerHeight - padding) / height
    );

    // Calculate the actual zoom percentage relative to real paper size
    const actualZoomPercentage = Math.round(baseScale * zoomLevel * 100);
    const fitToScreenPercentage = Math.round(baseScale * 100);

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
                        {/* Paper Size */}
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
                                <p className="text-xs text-gray-500 mt-1">
                                    {currentConfig.description}
                                </p>
                            </div>
                        </div>

                        {/* Text Fields - Only show fields available for selected paper type */}
                        <div className="space-y-4">
                            {currentConfig.fields.includes('topLeft') && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Top Left (Header)
                                        </label>
                                        <span className={`text-xs ${
                                            isAtLimit('topLeft') ? 'text-red-600 font-semibold' :
                                                isNearLimit('topLeft') ? 'text-orange-600' : 'text-gray-500'
                                        }`}>
                                            {getCharacterCount('topLeft')}/{getCharacterLimit('topLeft')}
                                        </span>
                                    </div>
                                    <textarea
                                        value={letterData.topLeft}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('topLeft', e.target.value)}
                                        className={`w-full h-24 border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isAtLimit('topLeft') ? 'border-red-500 bg-red-50' :
                                                isNearLimit('topLeft') ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Company info, address..."
                                        maxLength={getCharacterLimit('topLeft')}
                                    />
                                </div>
                            )}

                            {currentConfig.fields.includes('topRight') && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Top Right (Date, Reference)
                                        </label>
                                        <span className={`text-xs ${
                                            isAtLimit('topRight') ? 'text-red-600 font-semibold' :
                                                isNearLimit('topRight') ? 'text-orange-600' : 'text-gray-500'
                                        }`}>
                                            {getCharacterCount('topRight')}/{getCharacterLimit('topRight')}
                                        </span>
                                    </div>
                                    <textarea
                                        value={letterData.topRight}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('topRight', e.target.value)}
                                        className={`w-full h-20 border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isAtLimit('topRight') ? 'border-red-500 bg-red-50' :
                                                isNearLimit('topRight') ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Date, reference number..."
                                        maxLength={getCharacterLimit('topRight')}
                                    />
                                </div>
                            )}

                            {currentConfig.fields.includes('body') && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Body Text
                                        </label>
                                        <span className={`text-xs ${
                                            isAtLimit('body') ? 'text-red-600 font-semibold' :
                                                isNearLimit('body') ? 'text-orange-600' : 'text-gray-500'
                                        }`}>
                                            {getCharacterCount('body')}/{getCharacterLimit('body')}
                                        </span>
                                    </div>
                                    <textarea
                                        value={letterData.body}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('body', e.target.value)}
                                        className={`w-full h-64 border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            isAtLimit('body') ? 'border-red-500 bg-red-50' :
                                                isNearLimit('body') ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Dear {{name}}, main content..."
                                        maxLength={getCharacterLimit('body')}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Download Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={downloadSVG}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <Download className="w-4 h-4" />
                                Download SVG
                            </button>

                            {/* Template Tags Section */}
                            {templateTags.length > 0 && (
                                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Table className="w-4 h-4" />
                                            Template Tags ({templateTags.length})
                                        </h4>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {templateTags.map(tag => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {`{{${tag}}}`}
                                            </span>
                                        ))}
                                    </div>

                                    <button
                                        onClick={downloadCSVTemplate}
                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download CSV Template
                                    </button>
                                </div>
                            )}

                            {templateTags.length === 0 && (
                                <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                                    <p className="text-sm text-gray-500 text-center">
                                        No template tags found. Add tags like <code className="bg-gray-200 px-1 rounded text-xs">{'{{name}}'}</code> to enable CSV template download.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Visual Preview */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Visual Preview</h3>
                            <div className="text-right">
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-gray-500">
                                        Paper: {paperSize} | Fit to Screen: {fitToScreenPercentage}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Prominent Zoom Status and Controls */}
                        <div className="mb-4">
                            {/* Current Zoom Display */}
                            <div className={`p-3 rounded-lg border-2 mb-3 ${
                                zoomLevel > 1.5
                                    ? 'bg-orange-50 border-orange-300'
                                    : zoomLevel > 1
                                        ? 'bg-blue-50 border-blue-300'
                                        : 'bg-green-50 border-green-300'
                            }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className={`text-2xl font-bold ${
                                                zoomLevel > 1.5 ? 'text-orange-700' :
                                                    zoomLevel > 1 ? 'text-blue-700' : 'text-green-700'
                                            }`}>
                                                {actualZoomPercentage}%
                                            </div>
                                            <div className="text-xs text-gray-600">of actual size</div>
                                        </div>

                                        <div className="h-8 w-px bg-gray-300"></div>

                                        <div className="text-sm">
                                            {zoomLevel > 1.5 ? (
                                                <div className="text-orange-700">
                                                    <div className="font-medium">Zoomed In</div>
                                                    <div className="text-xs">Drag to pan around</div>
                                                </div>
                                            ) : zoomLevel > 1 ? (
                                                <div className="text-blue-700">
                                                    <div className="font-medium">Slightly Zoomed</div>
                                                    <div className="text-xs">Drag to pan</div>
                                                </div>
                                            ) : (
                                                <div className="text-green-700">
                                                    <div className="font-medium">Full Page View</div>
                                                    <div className="text-xs">Entire page visible</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {zoomLevel !== 1 && (
                                        <button
                                            onClick={handleResetView}
                                            className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            View Full Page
                                        </button>
                                    )}
                                </div>

                                {zoomLevel > 1.2 && (
                                    <div className="mt-2 text-xs text-gray-600 bg-white/60 rounded px-2 py-1">
                                        💡 <strong>Tip:</strong> Click &ldquo;View Full Page&rdquo; to see the entire document at once
                                    </div>
                                )}
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleZoomOut}
                                    className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleZoomIn}
                                    className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleResetView}
                                    className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                                    title="Reset to Full Page View"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-gray-500 ml-2">
                                    Ctrl+scroll to zoom | {zoomLevel > 1 ? 'Drag to pan' : 'Click zoom buttons'}
                                </span>
                            </div>
                        </div>

                        <div
                            ref={previewContainerRef}
                            className="bg-gray-300 shadow-lg mx-auto border overflow-hidden relative flex items-center justify-center"
                            style={{
                                width: `${containerWidth}px`,
                                height: `${containerHeight}px`,
                                cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default'
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onWheel={handleWheel}
                        >
                            <div
                                className="bg-white shadow-md border border-gray-400"
                                style={{
                                    width: width * baseScale,
                                    height: height * baseScale,
                                    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                    transformOrigin: 'center center'
                                }}
                            >
                                <svg
                                    id="letter-svg"
                                    width={width * baseScale}
                                    height={height * baseScale}
                                    viewBox={`0 0 ${width} ${height}`}
                                    className="w-full h-full"
                                >
                                    {/* White background */}
                                    <rect width={width} height={height} fill="white" />

                                    {/* Render only the sections available for this paper type */}
                                    {renderPreviewSections()}
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );

}