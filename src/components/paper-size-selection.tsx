import React, { ChangeEvent } from "react";
import { PaperSize, PaperSizes } from "@/lib/paper-dimension.config";

export default function PaperSizeSelection({
    description,
    paperSize,
    paperSizes,
    setPaperSize,
}: {
    description: string;
    paperSize: PaperSize;
    paperSizes: PaperSizes;
    setPaperSize: React.Dispatch<React.SetStateAction<keyof PaperSizes>>;
}) {
    return (
        <div className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Size
                </label>
                <select
                    value={paperSize}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setPaperSize(e.target.value as PaperSize)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.keys(paperSizes).map((key) => (
                        <option key={key} value={key}>
                            {`${paperSizes[key as keyof PaperSizes].label} ${paperSizes[key as keyof PaperSizes].widthMm}mm x ${paperSizes[key as keyof PaperSizes].heightMm}mm`}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
        </div>
    );
}
