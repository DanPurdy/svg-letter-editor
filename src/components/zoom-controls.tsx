import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import React from "react";

export default function ZoomControls({
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    zoomLevel,
}: {
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleResetView: () => void;
    zoomLevel: number;
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleZoomOut}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                title="Zoom Out"
            >
                <ZoomOut className="w-4 h-4" />
            </button>
            <button
                onClick={handleZoomIn}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                title="Zoom In"
            >
                <ZoomIn className="w-4 h-4" />
            </button>
            <button
                onClick={handleResetView}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                title="Reset to Full Page View"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500 ml-2">
                Ctrl+scroll to zoom |{" "}
                {zoomLevel > 1 ? "Drag to pan" : "Click zoom buttons"}
            </span>
        </div>
    );
}
