import React from "react";
import { CsvRecord, LetterData } from "@components/svg-letter-editor";
import { formatText } from "@/utils/format-text";
import { PaperTypeConfig } from "@/lib/paper-dimension.config";

export default function PreviewSections({
    config,
    letterData,
    currentData,
    width,
}: {
    config: PaperTypeConfig;
    letterData: LetterData;
    currentData: CsvRecord;
    width: number;
}) {
    const renderPreviewSections = () => {
        const sections = [];

        if (config.fields.includes("topLeft")) {
            sections.push(
                <g key="topLeft">
                    {formatText(
                        letterData.topLeft,
                        currentData,
                        "topLeft",
                        width,
                    ).map((line: string, index: number) => (
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
                </g>,
            );
        }

        if (config.fields.includes("topRight")) {
            sections.push(
                <g key="topRight">
                    {formatText(
                        letterData.topRight,
                        currentData,
                        "topRight",
                        width,
                    ).map((line: string, index: number) => (
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
                </g>,
            );
        }

        if (config.fields.includes("body")) {
            sections.push(
                <g key="body">
                    {formatText(
                        letterData.body,
                        currentData,
                        "body",
                        width,
                    ).map((line: string, index: number) => (
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
                </g>,
            );
        }

        return sections;
    };

    return renderPreviewSections();
}
