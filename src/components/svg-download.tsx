import { Download } from "lucide-react";
import React from "react";
import { CsvRecord, LetterData } from "@components/svg-letter-editor";
import { formatText } from "@/utils/format-text";
import {
    PaperDimensions,
    PaperSize,
    PaperTypeConfig,
} from "@/lib/paper-dimension.config";

export default function SvgDownload({
    config,
    currentData,
    letterData,
    paperDimensions,
    paperSize = "A4",
}: {
    config: PaperTypeConfig;
    currentData: CsvRecord;
    letterData: LetterData;
    paperDimensions: PaperDimensions;
    paperSize?: PaperSize;
}) {
    const generateSVGString = ({
        paperDimensions: { width, height },
    }: {
        paperDimensions: PaperDimensions;
    }): string => {
        const escapeXml = (text: string): string => {
            return text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        };

        let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- White background -->
  <rect width="${width}" height="${height}" fill="white"/>
  `;

        // Only include sections that are configured for this paper type
        if (config.fields.includes("topLeft")) {
            const topLeftLines: string[] = formatText(
                letterData.topLeft,
                currentData,
                "topLeft",
                width,
            );
            svgContent += `
  <!-- Top Left -->
  <g id="top-left">
${topLeftLines
    .map(
        (line: string, index: number) =>
            `    <text x="60" y="${80 + index * 24}" font-size="16" font-family="Brush Script MT, cursive" fill="#333">${escapeXml(line)}</text>`,
    )
    .join("\n")}
  </g>`;
        }

        if (config.fields.includes("topRight")) {
            const topRightLines: string[] = formatText(
                letterData.topRight,
                currentData,
                "topRight",
                width,
            );
            svgContent += `

  <!-- Top Right -->
  <g id="top-right">
${topRightLines
    .map(
        (line: string, index: number) =>
            `    <text x="${width - 60}" y="${80 + index * 24}" font-size="16" font-family="Brush Script MT, cursive" fill="#333" text-anchor="end">${escapeXml(line)}</text>`,
    )
    .join("\n")}
  </g>`;
        }

        if (config.fields.includes("body")) {
            const bodyLines: string[] = formatText(
                letterData.body,
                currentData,
                "body",
                width,
            );
            svgContent += `

  <!-- Body -->
  <g id="body">
${bodyLines
    .map(
        (line: string, index: number) =>
            `    <text x="60" y="${config.bodyStartY + index * 26}" font-size="16" font-family="Brush Script MT, cursive" fill="#333">${escapeXml(line)}</text>`,
    )
    .join("\n")}
  </g>`;
        }

        svgContent += `
</svg>`;

        return svgContent;
    };

    const downloadSVG = (): void => {
        try {
            const svgString: string = generateSVGString({ paperDimensions });

            const blob: Blob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url: string = URL.createObjectURL(blob);

            const link: HTMLAnchorElement = document.createElement("a");
            link.href = url;
            link.download = `letter-${paperSize}-template.svg`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error(error);
            alert("Download failed. Please try again.");
        }
    };
    return (
        <button
            onClick={downloadSVG}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <Download className="w-4 h-4" />
            Download SVG
        </button>
    );
}
