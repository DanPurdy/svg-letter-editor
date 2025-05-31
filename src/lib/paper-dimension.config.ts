// Paper dimensions in pixels are for 96 DPI
import { LetterData } from "@components/svg-letter-editor";

export interface PaperDimensions {
    width: number;
    height: number;
    widthMm: number;
    heightMm: number;
    label: string;
}

export interface PaperSizes {
    A4: PaperDimensions;
    A5Portrait: PaperDimensions;
    A5Landscape: PaperDimensions;
    A6Portrait: PaperDimensions;
    A6Landscape: PaperDimensions;
}

export type PaperSize = keyof PaperSizes;
export type LetterSection = keyof LetterData;

export interface PaperTypeConfig {
    fields: LetterSection[];
    bodyStartY: number;
    description: string;
    maxCharacters: Record<LetterSection, number>;
}

export type PaperTypeConfigMap = Record<PaperSize, PaperTypeConfig>;

export const paperDimensions: PaperSizes = {
    A4: {
        width: 794,
        height: 1123,
        widthMm: 210,
        heightMm: 297,
        label: "A4",
    },
    A5Portrait: {
        width: 559,
        height: 794,
        widthMm: 148,
        heightMm: 210,
        label: "A5 Portrait",
    },
    A5Landscape: {
        width: 794,
        height: 559,
        widthMm: 210,
        heightMm: 148,
        label: "A5 Landscape",
    },
    A6Portrait: {
        width: 397,
        height: 559,
        widthMm: 105,
        heightMm: 148,
        label: "A6 Portrait",
    },
    A6Landscape: {
        width: 559,
        height: 397,
        widthMm: 148,
        heightMm: 105,
        label: "A6 Landscape",
    },
};

export const paperTypeConfig: PaperTypeConfigMap = {
    A4: {
        fields: ["topLeft", "topRight", "body"] as LetterSection[],
        bodyStartY: 250,
        description: "Full letter format with header and body",
        maxCharacters: {
            topLeft: 300,
            topRight: 150,
            body: 2500,
        },
    },
    A5Portrait: {
        fields: ["body"] as LetterSection[],
        bodyStartY: 80,
        description: "Body text only format",
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 1800,
        },
    },
    A5Landscape: {
        fields: ["body"] as LetterSection[],
        bodyStartY: 80,
        description: "Body text only format",
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 1200,
        },
    },
    A6Portrait: {
        fields: ["body"] as LetterSection[],
        bodyStartY: 80,
        description: "Body text only format",
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 1000,
        },
    },
    A6Landscape: {
        fields: ["body"] as LetterSection[],
        bodyStartY: 80,
        description: "Body text only format",
        maxCharacters: {
            topLeft: 0,
            topRight: 0,
            body: 600,
        },
    },
};
