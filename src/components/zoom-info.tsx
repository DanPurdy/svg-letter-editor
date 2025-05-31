import { RotateCcw } from "lucide-react";
import React from "react";

export default function ZoomInfo({
    baseScale,
    handleResetView,
    zoomLevel,
}: {
    baseScale: number;
    handleResetView: () => void;
    zoomLevel: number;
}) {
    const actualZoomPercentage = Math.round(baseScale * zoomLevel * 100);

    return (
        <div
            className={`p-3 rounded-lg border-2 mb-3 ${
                zoomLevel > 1.5
                    ? "bg-orange-50 border-orange-300"
                    : zoomLevel > 1
                      ? "bg-blue-50 border-blue-300"
                      : "bg-green-50 border-green-300"
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div
                            className={`text-2xl font-bold ${
                                zoomLevel > 1.5
                                    ? "text-orange-700"
                                    : zoomLevel > 1
                                      ? "text-blue-700"
                                      : "text-green-700"
                            }`}
                        >
                            {actualZoomPercentage}%
                        </div>
                        <div className="text-xs text-gray-600">
                            of actual size
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-300"></div>

                    <div className="text-sm">
                        {zoomLevel > 1.5 ? (
                            <div className="text-orange-700">
                                <div className="font-medium">Zoomed In</div>
                                <div className="text-xs">
                                    Drag to pan around
                                </div>
                            </div>
                        ) : zoomLevel > 1 ? (
                            <div className="text-blue-700">
                                <div className="font-medium">
                                    Slightly Zoomed
                                </div>
                                <div className="text-xs">Drag to pan</div>
                            </div>
                        ) : (
                            <div className="text-green-700">
                                <div className="font-medium">
                                    Full Page View
                                </div>
                                <div className="text-xs">
                                    Entire page visible
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {zoomLevel !== 1 && (
                    <button
                        onClick={handleResetView}
                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        View Full Page
                    </button>
                )}
            </div>

            {zoomLevel > 1.2 && (
                <div className="mt-2 text-xs text-gray-600 bg-white/60 rounded px-2 py-1">
                    💡 <strong>Tip:</strong> Click &ldquo;View Full Page&rdquo;
                    to see the entire document at once
                </div>
            )}
        </div>
    );
}
