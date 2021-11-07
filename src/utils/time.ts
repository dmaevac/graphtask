type ResolutionKey = 'h' | 'm' | 's';

const resolutionsSlices: Record<ResolutionKey, [number, number]> = {
  h: [11, 23],
  m: [14, 23],
  s: [17, 23],
};

export const formatElapsed = (start: number, end = Date.now(), resolution: ResolutionKey = 'm'): string => {
  return new Date(end - start)
    .toISOString()
    .slice(...resolutionsSlices[resolution]);
};
