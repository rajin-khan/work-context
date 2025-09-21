// src/utils/spacingCalculator.js
export const scales = {
  'Minor Second': 1.067,
  'Major Second': 1.125,
  'Minor Third': 1.200,
  'Major Third': 1.250,
  'Perfect Fourth': 1.333,
  'Augmented Fourth': 1.414,
  'Perfect Fifth': 1.500,
  'Golden Ratio': 1.618,
};

const generateScaleIndices = (negativeSteps, positiveSteps) => {
  const indices = [];
  for (let i = negativeSteps; i >= 2; i--) {
    indices.push(`${i}xs`);
  }
  indices.push('xs', 's', 'm', 'l', 'xl');
  for (let i = 2; i <= positiveSteps; i++) {
    indices.push(`${i}xl`);
  }
  return indices;
};

export const generateSpacingScale = (settings) => {
  const {
    namingConvention,
    minSize,
    maxSize,
    minScaleRatio,
    maxScaleRatio,
    baseScaleIndex,
    negativeSteps = 4,
    positiveSteps = 4,
  } = settings;
  
  const scaleIndices = generateScaleIndices(negativeSteps, positiveSteps);
  
  const positionMap = {
    ...Object.fromEntries(Array.from({ length: negativeSteps }, (_, i) => [`${i + 1}xs`, -(i + 1)])),
    's': 0, 'm': 1, 'l': 2,
    ...Object.fromEntries(Array.from({ length: positiveSteps }, (_, i) => [`${i + 1}xl`, i + 3])),
  };
  
  const baseRemapping = { 'xs': '1xs', 'xl': '1xl'};
  const remappedBaseIndex = baseRemapping[baseScaleIndex] || baseScaleIndex;

  const baseIndexPosition = positionMap[remappedBaseIndex];

  return scaleIndices.map((indexName) => {
    const remappedIndexName = baseRemapping[indexName] || indexName;
    const currentIndexPosition = positionMap[remappedIndexName];
    const distance = currentIndexPosition - baseIndexPosition;

    let min, max;

    if (distance === 0) {
      min = minSize;
      max = maxSize;
    } else if (distance > 0) {
      min = minSize * Math.pow(minScaleRatio, distance);
      max = maxSize * Math.pow(maxScaleRatio, distance);
    } else {
      min = minSize / Math.pow(minScaleRatio, -distance);
      max = maxSize / Math.pow(maxScaleRatio, -distance);
    }
    
    const formatValue = (num) => (num % 1 === 0 ? num : parseFloat(num.toFixed(2)));

    return {
      id: indexName,
      name: `--${namingConvention}-${indexName}`,
      min: formatValue(min),
      max: formatValue(max),
      isBase: indexName === baseScaleIndex,
    };
  });
};