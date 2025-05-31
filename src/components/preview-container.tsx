import PreviewSections from "@components/preview-sections";
import React, { useCallback, useRef, useState } from "react";
import { CsvRecord, LetterData } from "@components/svg-letter-editor";
import { PaperDimensions, PaperTypeConfig } from "@/lib/paper-dimension.config";

export default function PreviewContainer({
    baseScale,
    containerWidth,
    containerHeight,
    config: currentConfig,
    currentData,
    letterData,
    panOffset,
    paperDimensions: { width, height },
    setPanOffset,
    setZoomLevel,
    zoomLevel,
}: {
    baseScale: number;
    containerWidth: number;
    containerHeight: number;
    config: PaperTypeConfig;
    currentData: CsvRecord;
    letterData: LetterData;
    panOffset: {
        x: number;
        y: number;
    };
    paperDimensions: PaperDimensions;
    setPanOffset: React.Dispatch<
        React.SetStateAction<{
            x: number;
            y: number;
        }>
    >;
    setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
    zoomLevel: number;
}) {
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const previewContainerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (zoomLevel > 1) {
                // Only allow panning when zoomed in
                setIsPanning(true);
                setLastMousePos({ x: e.clientX, y: e.clientY });
                e.preventDefault();
            }
        },
        [zoomLevel],
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (isPanning && zoomLevel > 1) {
                const deltaX = e.clientX - lastMousePos.x;
                const deltaY = e.clientY - lastMousePos.y;

                setPanOffset((prev) => ({
                    x: prev.x + deltaX,
                    y: prev.y + deltaY,
                }));

                setLastMousePos({ x: e.clientX, y: e.clientY });
            }
        },
        [isPanning, lastMousePos, zoomLevel],
    );

    const handleMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Zoom with Ctrl/Cmd + scroll
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev * delta)));
        }
    }, []);

    return (
        <div
            ref={previewContainerRef}
            className="bg-gray-300 shadow-lg mx-auto border overflow-hidden relative flex items-center justify-center"
            style={{
                width: `${containerWidth}px`,
                height: `${containerHeight}px`,
                cursor:
                    zoomLevel > 1
                        ? isPanning
                            ? "grabbing"
                            : "grab"
                        : "default",
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
                    transformOrigin: "center center",
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
                    <PreviewSections
                        config={currentConfig}
                        currentData={currentData}
                        letterData={letterData}
                        width={width}
                    />
                </svg>
            </div>
        </div>
    );
}
