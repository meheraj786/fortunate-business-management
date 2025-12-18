import { useState, useCallback, useRef } from "react";

export const useSectionManager = (sections) => {
  const sectionRefs = useRef(new Map());
  const [expandedSections, setExpandedSections] = useState(() => {
    const initial = {};
    sections.forEach((section, index) => {
      initial[section.id] = index === 0; // Expand first section by default
    });
    return initial;
  });

  const setSectionRef = useCallback((sectionId, element) => {
    if (element) {
      sectionRefs.current.set(sectionId, element);
    } else {
      sectionRefs.current.delete(sectionId);
    }
  }, []);

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => {
      const isNowExpanded = !prev[sectionId];

      if (isNowExpanded) {
        const element = sectionRefs.current.get(sectionId);
        if (element) {
          // Timeout to allow the collapsible animation to finish before scrolling
          setTimeout(() => {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 300); // Adjust timeout to match animation duration
        }
      }

      return {
        ...prev,
        [sectionId]: isNowExpanded,
      };
    });
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

  return {
    expandedSections,
    toggleSection,
    expandSection,
    collapseSection,
    setSectionRef,
  };
};
