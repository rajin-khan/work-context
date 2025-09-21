// src/pages/ScalesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import SpacingSidebar from '../components/spacing/SpacingSidebar';
import SpacingVisualization from '../components/spacing/SpacingVisualization';
import { generateSpacingScale } from '../utils/spacingCalculator';

const ScalesPage = ({ 
  spacingGroups,
  onAddSpacingGroup,
  onUpdateSpacingGroup,
  onUpdateSpacingGroupName,
  onRemoveSpacingGroup,
  onStepsChange 
}) => {
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Effect to set the initial active group or handle group deletion
  useEffect(() => {
    if (!activeGroupId && spacingGroups.length > 0) {
      setActiveGroupId(spacingGroups[0].id);
    } else if (activeGroupId && !spacingGroups.some(g => g.id === activeGroupId)) {
      setActiveGroupId(spacingGroups.length > 0 ? spacingGroups[0].id : null);
    }
  }, [spacingGroups, activeGroupId]);

  const activeGroup = useMemo(() => {
    return spacingGroups.find(g => g.id === activeGroupId);
  }, [spacingGroups, activeGroupId]);

  // The scale for the visualization is now generated from only the active group
  const activeScale = useMemo(() => {
    if (!activeGroup) return [];
    return generateSpacingScale(activeGroup.settings);
  }, [activeGroup]);

  const handleAddGroupAndSetActive = () => {
    const newId = onAddSpacingGroup();
    setActiveGroupId(newId);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex">
        <SpacingSidebar 
          groups={spacingGroups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroupId}
          onUpdateGroup={onUpdateSpacingGroup}
          onUpdateGroupName={onUpdateSpacingGroupName}
          onRemoveGroup={onRemoveSpacingGroup}
          onAddGroup={handleAddGroupAndSetActive}
        />
        <div className="flex-1">
          {activeGroup && (
            <SpacingVisualization 
              scale={activeScale} 
              onStepsChange={(type, amount) => onStepsChange(activeGroupId, type, amount)}
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

export default ScalesPage;