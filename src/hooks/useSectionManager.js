import { useState, useCallback } from "react";

export const useSectionManager = (sections) => {
  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    sections.forEach((section, index) => {
      initial[section.id] = index === 0; // Expand first section by default
    });
    return initial;
  });

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const expandSection = useCallback((sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: true,
    }));
  }, []);

  const collapseSection = useCallback((sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: false,
    }));
  }, []);

  const scrollToSection = useCallback(
    (sectionId, element) => {
      if (element && expandedSections[sectionId]) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);
      }
    },
    [expandedSections]
  );

  return {
    expandedSections,
    toggleSection,
    expandSection,
    collapseSection,
    scrollToSection,
  };
};
