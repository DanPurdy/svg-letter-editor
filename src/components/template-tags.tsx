import { Download, Table } from "lucide-react";
import React, { useMemo } from "react";
import { LetterData } from "@components/svg-letter-editor";
import { PaperSize, PaperTypeConfig } from "@/lib/paper-dimension.config";

export default function TemplateTags({
    config,
    letterData,
    paperSize = "A4",
}: {
    config: PaperTypeConfig;
    letterData: LetterData;
    paperSize?: PaperSize;
}) {
    // Extract template tags from all active fields
    const templateTags = useMemo(() => {
        const tags = new Set<string>();
        const templateRegex = /\{\{([^}]+)\}\}/g;

        // Only extract tags from fields that are active for the current paper type
        config.fields.forEach((field) => {
            const text = letterData[field];
            let match;
            while ((match = templateRegex.exec(text)) !== null) {
                tags.add(match[1].trim());
            }
        });

        return Array.from(tags).sort();
    }, [letterData, config.fields]);

    const downloadCSVTemplate = (): void => {
        try {
            if (templateTags.length === 0) {
                alert("No template tags found in the current document.");
                return;
            }

            // Create CSV content with headers
            const csvContent = templateTags.join(",") + "\n";

            const blob: Blob = new Blob([csvContent], {
                type: "text/csv;charset=utf-8",
            });
            const url: string = URL.createObjectURL(blob);

            const link: HTMLAnchorElement = document.createElement("a");
            link.href = url;
            link.download = `letter-template-${paperSize}.csv`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error(error);
            alert("CSV download failed. Please try again.");
        }
    };

    if (templateTags.length > 0) {
        return (
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Table className="w-4 h-4" />
                        Template Tags ({templateTags.length})
                    </h4>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    {templateTags.map((tag) => (
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
        );
    }
    return (
        <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <p className="text-sm text-gray-500 text-center">
                No template tags found. Add tags like{" "}
                <code className="bg-gray-200 px-1 rounded text-xs">
                    {"{{name}}"}
                </code>{" "}
                to enable CSV template download.
            </p>
        </div>
    );
}
