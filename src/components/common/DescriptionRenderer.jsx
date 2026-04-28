import React, { useMemo } from "react";
import { formatAccountLabel } from "@/utils/format";

/**
 * Enhanced Description Renderer Component
 * Parses transaction descriptions and renders account labels and customer names
 * as color-coded chips.
 *
 * Supported Patterns:
 * 1. "Account: <Label>"
 * 2. "Transfer to <Label>"
 * 3. "Transfer from <Label>"
 * 4. "from <CustomerName> via" (customer highlight)
 * 5. "(Customer: <CustomerName>)" (customer highlight)
 *
 * Color Coding Strategy:
 * - Bank: Blue/Primary (e.g., "Bank Asia")
 * - Mobile Banking: Purple (e.g., "Bkash", "Nagad")
 * - Cash: Green/Success (e.g., "Main Cash")
 * - Customer: Amber/Orange (e.g., "Mr. Rahman")
 *
 * @param {string} description - The raw description text
 * @param {Object} [account] - The populated account object (accountId).
 *   When provided, the chip label is dynamically replaced with the
 *   current formatAccountLabel output, so old descriptions auto-update.
 */
const DescriptionRenderer = ({ description, account }) => {
    // Pre-compute the live label once (if account is available)
    const liveLabel = useMemo(
        () => (account ? formatAccountLabel(account) : null),
        [account],
    );

    const parts = useMemo(() => {
        if (!description) return [];

        // Combined regex for all highlight patterns:
        // Group 1: Account: ... (to end of string)
        // Group 2: Transfer to/from ... (until " - " or end)
        // Group 3: from <name> via (customer in payment descriptions)
        // Group 4: (Customer: <name>) (customer in reversal descriptions)
        const regex = /(Account:\s+.*$)|(Transfer (?:to|from)\s+.*?(?=\s+-\s+|$))|(from\s+(.+?)\s+via\s)|(\(Customer:\s+(.+?)\))/g;

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

            if (match[1]) {
                // Account: pattern
                let prefix = "Account: ";
                let rawLabel = fullMatch.substring(9);
                if (rawLabel.endsWith(".")) {
                    rawLabel = rawLabel.slice(0, -1);
                }
                const label = rawLabel.trim();
                const displayLabel =
                    liveLabel && fullMatch.startsWith("Account:") ? liveLabel : label;

                result.push({ type: 'account', prefix, label: displayLabel });
            } else if (match[2]) {
                // Transfer to/from pattern
                let prefix, label;
                if (fullMatch.startsWith("Transfer to")) {
                    prefix = "Transfer to ";
                    label = fullMatch.substring(11).trim();
                } else {
                    prefix = "Transfer from ";
                    label = fullMatch.substring(13).trim();
                }
                result.push({ type: 'account', prefix, label });
            } else if (match[3]) {
                // "from <name> via " pattern — customer
                const customerName = match[4];
                result.push({ type: 'text', content: 'from ' });
                result.push({ type: 'customer', label: customerName });
                result.push({ type: 'text', content: ' via ' });
            } else if (match[5]) {
                // "(Customer: <name>)" pattern — customer
                const customerName = match[6];
                result.push({ type: 'text', content: '(' });
                result.push({ type: 'customer', label: customerName, prefix: 'Customer: ' });
                result.push({ type: 'text', content: ')' });
            }

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < description.length) {
            result.push({
                type: 'text',
                content: description.slice(lastIndex)
            });
        }

        return result;
    }, [description, liveLabel]);

    if (!description) return <span className="text-gray-500 italic">No description</span>;

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
                } else if (part.type === 'customer') {
                    return (
                        <span key={index} className="inline-flex items-center align-middle">
                            {part.prefix && <span className="mr-1">{part.prefix}</span>}
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
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
