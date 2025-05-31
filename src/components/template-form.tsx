import PaperSizeSelection from "@components/paper-size-selection";
import {
    PaperDimensions,
    PaperSize,
    PaperSizes,
    PaperTypeConfig,
} from "@/lib/paper-dimension.config";
import TemplateTextInputGroup from "@components/template-text-input-group";
import SvgDownload from "@components/svg-download";
import TemplateTags from "@components/template-tags";
import React from "react";
import { CsvRecord, LetterData } from "@components/svg-letter-editor";

export default function TemplateForm({
    config,
    currentData,
    letterData,
    paperDimensions,
    paperSize = "A4",
    paperSizes,
    setPaperSize,
    setLetterData,
}: {
    config: PaperTypeConfig;
    currentData: CsvRecord;
    letterData: LetterData;
    paperDimensions: PaperDimensions;
    paperSize?: PaperSize;
    paperSizes: PaperSizes;
    setPaperSize: React.Dispatch<React.SetStateAction<keyof PaperSizes>>;
    setLetterData: React.Dispatch<React.SetStateAction<LetterData>>;
}) {
    return (
        <div className="space-y-6">
            <PaperSizeSelection
                description={config.description}
                paperSize={paperSize}
                paperSizes={paperSizes}
                setPaperSize={setPaperSize}
            />
            <TemplateTextInputGroup
                setLetterData={setLetterData}
                letterData={letterData}
                config={config}
            />

            {/* Download Buttons */}
            <div className="space-y-3">
                <SvgDownload
                    config={config}
                    currentData={currentData}
                    letterData={letterData}
                    paperDimensions={paperDimensions}
                    paperSize={paperSize}
                />
                <TemplateTags
                    config={config}
                    letterData={letterData}
                    paperSize={paperSize}
                />
            </div>
        </div>
    );
}
