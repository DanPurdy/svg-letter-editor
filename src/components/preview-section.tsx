import ZoomInfo from "@components/zoom-info";
import ZoomControls from "@components/zoom-controls";
import PreviewContainer from "@components/preview-container";
import React, { useCallback, useEffect, useState } from "react";
import { CsvRecord, LetterData } from "@components/svg-letter-editor";
import {
    PaperDimensions,
    PaperSize,
    PaperTypeConfig,
} from "@/lib/paper-dimension.config";

export default function PreviewSection({
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
    const { width, height } = paperDimensions;
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    // Reset zoom and pan when the paper size changes
    useEffect(() => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    }, [paperSize]);

    const handleZoomIn = useCallback(() => {
        setZoomLevel((prev) => Math.min(prev * 1.2, 3)); // Max zoom 3x
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel((prev) => Math.max(prev / 1.2, 0.3)); // Min zoom 0.3x
    }, []);

    const handleResetView = useCallback(() => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    }, []);

    // Calculate container dimensions based on the current paper aspect ratio
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

    // Calculate base scale to fit paper in a container with some padding
    const padding = 40; // 20 px padding on each side
    const baseScale = Math.min(
        (containerWidth - padding) / width,
        (containerHeight - padding) / height,
    );

    const fitToScreenPercentage = Math.round(baseScale * 100);
    return (
        <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Visual Preview
                </h3>
                <div className="text-right">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500">
                            Paper: {paperSize} | Fit to Screen:{" "}
                            {fitToScreenPercentage}%
                        </span>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <ZoomInfo
                    baseScale={baseScale}
                    handleResetView={handleResetView}
                    zoomLevel={zoomLevel}
                />
                <ZoomControls
                    handleZoomIn={handleZoomIn}
                    handleZoomOut={handleZoomOut}
                    handleResetView={handleResetView}
                    zoomLevel={zoomLevel}
                />
            </div>

            <PreviewContainer
                baseScale={baseScale}
                containerHeight={containerHeight}
                containerWidth={containerWidth}
                config={config}
                currentData={currentData}
                letterData={letterData}
                panOffset={panOffset}
                paperDimensions={paperDimensions}
                setPanOffset={setPanOffset}
                setZoomLevel={setZoomLevel}
                zoomLevel={zoomLevel}
            />
        </div>
    );
}
