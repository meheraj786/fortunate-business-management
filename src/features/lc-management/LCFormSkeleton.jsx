import React from 'react';
import FormSection from "@/components/ui/FormSection";
import { FileText, DollarSign, Package, Truck, User, Clipboard } from "lucide-react";

const SECTIONS_CONFIG = [
    { id: "basicInfo", title: "Basic Information", icon: FileText, defaultOpen: true },
    { id: "financialInfo", title: "Financial Information", icon: DollarSign, defaultOpen: true },
    { id: "productInfo", title: "Product Information", icon: Package, defaultOpen: true },
    { id: "shippingCustomsInfo", title: "Shipping & Customs", icon: Truck, defaultOpen: true },
    { id: "agentTransportInfo", title: "Agent & Transport", icon: User, defaultOpen: true },
    { id: "otherExpenses", title: "Other Expenses", icon: DollarSign, defaultOpen: true },
    { id: "documentsNotes", title: "Documents & Notes", icon: Clipboard, defaultOpen: true },
];

const InputFieldSkeleton = () => (
    <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
    </div>
);

const TextAreaFieldSkeleton = () => (
    <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
    </div>
);

const FileInputSkeleton = () => (
    <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse mb-2"></div>
        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 animate-pulse">
            <div className="h-8 w-8 bg-gray-300 rounded mb-3"></div>
            <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-300 rounded mt-1"></div>
        </div>
    </div>
);

const LCFormSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Header Skeleton */}
            <div className="bg-white rounded-lg shadow-lg p-5 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0">
                        <div className="h-7 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse mt-1"></div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>

            {SECTIONS_CONFIG.map((section) => (
                <FormSection
                    key={section.id}
                    title={section.title}
                    icon={section.icon}
                    isExpanded={true} // Always expanded in skeleton
                    onToggle={() => {}}
                    ariaLabel={`${section.title} section skeleton`}
                >
                    {section.id === "basicInfo" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {[...Array(6)].map((_, i) => (
                                <InputFieldSkeleton key={i} />
                            ))}
                        </div>
                    )}
                    {section.id === "financialInfo" && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <InputFieldSkeleton key={i} />
                                ))}
                            </div>
                            {/* CostsSection Skeleton */}
                            <div className="space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputFieldSkeleton />
                                    <InputFieldSkeleton />
                                </div>
                                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    )}
                    {section.id === "productInfo" && (
                        <div className="space-y-4 sm:space-y-6">
                            {[...Array(2)].map((_, productIndex) => (
                                <div key={productIndex} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50 mb-4">
                                    <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse mb-4"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[...Array(9)].map((_, i) => (
                                            <InputFieldSkeleton key={i} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                    )}
                    {section.id === "shippingCustomsInfo" && (
                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                <InputFieldSkeleton />
                                <InputFieldSkeleton />
                            </div>
                            {/* CostsSection Skeleton */}
                            <div className="space-y-4">
                                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputFieldSkeleton />
                                    <InputFieldSkeleton />
                                </div>
                                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    )}
                    {section.id === "agentTransportInfo" && (
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputFieldSkeleton />
                                <InputFieldSkeleton />
                            </div>
                            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    )}
                    {section.id === "otherExpenses" && (
                        <div className="space-y-4">
                            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputFieldSkeleton />
                                <InputFieldSkeleton />
                            </div>
                            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    )}
                    {section.id === "documentsNotes" && (
                        <div className="space-y-6">
                            <TextAreaFieldSkeleton />
                            <div className="space-y-3">
                                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
                                    <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <FileInputSkeleton />
                            </div>
                        </div>
                    )}
                </FormSection>
            ))}
            {/* Footer Skeleton */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-0 mt-6 flex justify-between items-center">
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        </div>
    );
};

export default LCFormSkeleton;