import React, { ChangeEvent } from "react";
import { LetterData } from "@components/svg-letter-editor";
import { LetterSection, PaperTypeConfig } from "@/lib/paper-dimension.config";

export default function TemplateTextInputGroup({
    config,
    setLetterData,
    letterData,
}: {
    config: PaperTypeConfig;
    letterData: LetterData;
    setLetterData: React.Dispatch<React.SetStateAction<LetterData>>;
}) {
    const handleInputChange = (field: LetterSection, value: string): void => {
        const maxLength = config.maxCharacters[field];

        // Truncate the value if it exceeds the character limit
        const truncatedValue =
            maxLength > 0 ? value.slice(0, maxLength) : value;

        setLetterData((prev) => ({
            ...prev,
            [field]: truncatedValue,
        }));
    };

    const getCharacterCount = (field: LetterSection): number => {
        return letterData[field].length;
    };

    const getCharacterLimit = (field: LetterSection): number => {
        return config.maxCharacters[field];
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
    return (
        <div className="space-y-4">
            {config.fields.includes("topLeft") && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Top Left (Header)
                        </label>
                        <span
                            className={`text-xs ${
                                isAtLimit("topLeft")
                                    ? "text-red-600 font-semibold"
                                    : isNearLimit("topLeft")
                                      ? "text-orange-600"
                                      : "text-gray-500"
                            }`}
                        >
                            {getCharacterCount("topLeft")}/
                            {getCharacterLimit("topLeft")}
                        </span>
                    </div>
                    <textarea
                        value={letterData.topLeft}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange("topLeft", e.target.value)
                        }
                        className={`w-full h-24 border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isAtLimit("topLeft")
                                ? "border-red-500 bg-red-50"
                                : isNearLimit("topLeft")
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-300"
                        }`}
                        placeholder="Company info, address..."
                        maxLength={getCharacterLimit("topLeft")}
                    />
                </div>
            )}

            {config.fields.includes("topRight") && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Top Right (Date, Reference)
                        </label>
                        <span
                            className={`text-xs ${
                                isAtLimit("topRight")
                                    ? "text-red-600 font-semibold"
                                    : isNearLimit("topRight")
                                      ? "text-orange-600"
                                      : "text-gray-500"
                            }`}
                        >
                            {getCharacterCount("topRight")}/
                            {getCharacterLimit("topRight")}
                        </span>
                    </div>
                    <textarea
                        value={letterData.topRight}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange("topRight", e.target.value)
                        }
                        className={`w-full h-20 border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isAtLimit("topRight")
                                ? "border-red-500 bg-red-50"
                                : isNearLimit("topRight")
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-300"
                        }`}
                        placeholder="Date, reference number..."
                        maxLength={getCharacterLimit("topRight")}
                    />
                </div>
            )}

            {config.fields.includes("body") && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Body Text
                        </label>
                        <span
                            className={`text-xs ${
                                isAtLimit("body")
                                    ? "text-red-600 font-semibold"
                                    : isNearLimit("body")
                                      ? "text-orange-600"
                                      : "text-gray-500"
                            }`}
                        >
                            {getCharacterCount("body")}/
                            {getCharacterLimit("body")}
                        </span>
                    </div>
                    <textarea
                        value={letterData.body}
                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                            handleInputChange("body", e.target.value)
                        }
                        className={`w-full h-64 border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isAtLimit("body")
                                ? "border-red-500 bg-red-50"
                                : isNearLimit("body")
                                  ? "border-orange-500 bg-orange-50"
                                  : "border-gray-300"
                        }`}
                        placeholder="Dear {{name}}, main content..."
                        maxLength={getCharacterLimit("body")}
                    />
                </div>
            )}
        </div>
    );
}
