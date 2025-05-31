"use client";
import React, { useState } from "react";
import { FileText } from "lucide-react";
import PreviewSection from "@components/preview-section";
import {
    paperDimensions,
    PaperSize,
    paperTypeConfig,
} from "@/lib/paper-dimension.config";
import TemplateForm from "@components/template-form"; // Type definitions

export interface LetterData {
    topLeft: string;
    topRight: string;
    body: string;
}

export interface CsvRecord {
    [key: string]: string;
}

// Configuration for which fields are available for each paper type

export default function LetterGenerator() {
    const [paperSize, setPaperSize] = useState<PaperSize>("A4");
    const [letterData, setLetterData] = useState<LetterData>({
        topLeft:
            "{{company_name}}\n{{address_line_1}}\n{{address_line_2}}\n{{city}}, {{county}} {{postcode}}",
        topRight: "{{date}}\n{{reference_number}}",
        body: "Dear {{recipient_name}},\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nThank you for your continued business.\n\nBest regards,\nSteve\nMogul in Charge\nPenned",
    });

    // Get the current paper configuration
    const config = paperTypeConfig[paperSize];

    const currentData: CsvRecord = {}; // empty for now but was testing with being able to pass in a CSV record and see how it would look for a customer

    return (
        <div className="mx-auto p-6 bg-gray-50 min-h-screen text-gray-800">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h1 className="text-3xl font-bold text-gray-800">
                        Penned Template Generator
                    </h1>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <TemplateForm
                        config={config}
                        currentData={currentData}
                        letterData={letterData}
                        paperDimensions={paperDimensions[paperSize]}
                        paperSize={paperSize}
                        paperSizes={paperDimensions}
                        setPaperSize={setPaperSize}
                        setLetterData={setLetterData}
                    />
                    <PreviewSection
                        config={config}
                        currentData={currentData}
                        letterData={letterData}
                        paperDimensions={paperDimensions[paperSize]}
                        paperSize={paperSize}
                    />
                </div>
            </div>
        </div>
    );
}
