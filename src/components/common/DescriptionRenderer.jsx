import React, { useMemo } from "react";
import { useSettings } from "@/context/SettingsContext";

/**
 * Enhanced Description Renderer Component
 * Parses transaction descriptions and renders account labels as color-coded chips.
 *
 * Supported Patterns:
 * 1. "Account: <Label>"
 * 2. "Transfer to <Label>"
 * 3. "Transfer from <Label>"
 *
 * Color Coding Strategy:
 * - Bank: Blue/Primary (e.g., "Bank Asia")
 * - Mobile Banking: Purple (e.g., "Bkash", "Nagad")
 * - Cash: Green/Success (e.g., "Main Cash")
 */
const DescriptionRenderer = ({ description }) => {
    if (!description) return <span className="text-gray-500 italic">No description</span>;

    const parts = useMemo(() => {
        // Improved Regex to handle:
        // 1. Account: Match until the end of the string, optionally stripping a trailing dot.
        // 2. Transfer to/from: Match until " - " or end of string.
        const regex = /(Account:\s+.*$)|(Transfer (?:to|from)\s+.*?(?=\s+-\s+|$))/g;

        const result = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(description)) !== null) {
            if (match.index > lastIndex) {
                result.push({
                    type: 'text',
                    content: description.slice(lastIndex, match.index)
                });
            }

            const fullMatch = match[0];
            let prefix = "";
            let label = "";

            if (fullMatch.startsWith("Account:")) {
                prefix = "Account: ";
                // Remove trailing dot if present (since we matched to end of line)
                let rawLabel = fullMatch.substring(9);
                if (rawLabel.endsWith(".")) {
                    rawLabel = rawLabel.slice(0, -1);
                    // We don't add the dot back to 'content' here because it's usually just a terminator.
                    // But if we want to preserve it as text outside the chip, we can.
                    // For now, let's treat the chip as the value and the dot as implicit or removed for aesthetics.
                    // Actually, let's keep the dot as a text node AFTER the chip if strictly needed, 
                    // but removing it for the "Account" case looks cleaner as the chip acts as a visual block.
                }
                label = rawLabel.trim();
            } else if (fullMatch.startsWith("Transfer to")) {
                prefix = "Transfer to ";
                label = fullMatch.substring(11).trim();
            } else if (fullMatch.startsWith("Transfer from")) {
                prefix = "Transfer from ";
                label = fullMatch.substring(13).trim();
            }

            result.push({
                type: 'account',
                prefix,
                label
            });

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < description.length) {
            result.push({
                type: 'text',
                content: description.slice(lastIndex)
            });
        }

        return result;
    }, [description]);

    const getChipStyle = (label) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes("bkash") || lowerLabel.includes("nagad") || lowerLabel.includes("rocket") || lowerLabel.includes("upay")) {
            return "bg-purple-100 text-purple-700 border-purple-200";
        } else if (lowerLabel.includes("cash")) {
            return "bg-green-100 text-green-700 border-green-200";
        } else {
            return "bg-blue-100 text-blue-700 border-blue-200";
        }
    };

    return (
        <span>
            {parts.map((part, index) => {
                if (part.type === 'text') {
                    return <span key={index}>{part.content}</span>;
                } else if (part.type === 'account') {
                    return (
                        <span key={index} className="inline-flex items-center align-middle ml-1">
                            <span className="mr-1">{part.prefix}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getChipStyle(part.label)}`}>
                                {part.label}
                            </span>
                        </span>
                    );
                }
                return null;
            })}
        </span>
    );
};

export default DescriptionRenderer;
