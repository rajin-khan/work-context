// src/pages/TypographyPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import TypographySidebar from '../components/typography/TypographySidebar';
import TypographyVisualization from '../components/typography/TypographyVisualization';
import { generateSpacingScale } from '../utils/spacingCalculator';
import FeatureActivationScreen from '../components/ui/FeatureActivationScreen';

const TypographyPage = ({ 
  isTypographyEnabled,
  handleEnableTypography,
  typographyGroups,
  onAddTypographyGroup,
  onUpdateTypographyGroup,
  onUpdateTypographyGroupName,
  onRemoveTypographyGroup,
  onTypographyStepsChange 
}) => {
  const [activeGroupId, setActiveGroupId] = useState(null);

  useEffect(() => {
    if (!activeGroupId && typographyGroups.length > 0) {
      setActiveGroupId(typographyGroups[0].id);
    } else if (activeGroupId && !typographyGroups.some(g => g.id === activeGroupId)) {
      setActiveGroupId(typographyGroups.length > 0 ? typographyGroups[0].id : null);
    }
  }, [typographyGroups, activeGroupId]);

  const activeGroup = useMemo(() => {
    return typographyGroups.find(g => g.id === activeGroupId);
  }, [typographyGroups, activeGroupId]);

  const activeScale = useMemo(() => {
    if (!activeGroup) return [];
    return generateSpacingScale(activeGroup.settings);
  }, [activeGroup]);

  const handleAddGroupAndSetActive = () => {
    const newId = onAddTypographyGroup();
    setActiveGroupId(newId);
  };

  if (!isTypographyEnabled) {
    return (
      <FeatureActivationScreen
        title="Typography Features Not Enabled"
        description="Activate typography to generate a fluid, responsive type scale and utility classes for your project's text styles."
        buttonText="Enable Typography"
        onActivate={handleEnableTypography}
      />
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex">
        <TypographySidebar 
          groups={typographyGroups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroupId}
          onUpdateGroup={onUpdateTypographyGroup}
          onUpdateGroupName={onUpdateTypographyGroupName}
          onRemoveGroup={onRemoveTypographyGroup}
          onAddGroup={handleAddGroupAndSetActive}
        />
        <div className="flex-1">
          {activeGroup && (
            <TypographyVisualization 
              scale={activeScale} 
              onStepsChange={(type, amount) => onTypographyStepsChange(activeGroupId, type, amount)}
              steps={{ 
                negative: activeGroup.settings.negativeSteps, 
                positive: activeGroup.settings.positiveSteps 
              }} 
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TypographyPage;