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

const offsetToIndexName = (offset) => {
  if (offset === 0) return 'm';
  if (offset > 0) {
    if (offset === 1) return 'l';
    if (offset === 2) return 'xl';
    return `${offset - 1}xl`;
  }

  const magnitude = Math.abs(offset);
  if (magnitude === 1) return 's';
  if (magnitude === 2) return 'xs';
  return `${magnitude - 1}xs`;
};

const indexNameToOffset = (name) => {
  if (name === 'm') return 0;
  if (name === 'l') return 1;
  if (name === 'xl') return 2;

  if (name === 's') return -1;
  if (name === 'xs') return -2;

  const xlMatch = name.match(/^(\d+)xl$/);
  if (xlMatch) {
    return parseInt(xlMatch[1], 10) + 1;
  }

  const xsMatch = name.match(/^(\d+)xs$/);
  if (xsMatch) {
    return -(parseInt(xsMatch[1], 10) + 1);
  }

  return 0;
};

const generateScaleOffsets = (negativeSteps, positiveSteps) => {
  const offsets = [];
  for (let offset = -negativeSteps; offset <= positiveSteps; offset++) {
    offsets.push(offset);
  }
  return offsets;
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
  
  const baseOffset = indexNameToOffset(baseScaleIndex);
  const offsets = generateScaleOffsets(negativeSteps, positiveSteps);

  return offsets.map((offset) => {
    const indexName = offsetToIndexName(offset);
    const distance = offset - baseOffset;

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