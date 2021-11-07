export const replaceUnicode = (s = ''): string =>
  JSON.stringify(s).replace(/\\u([0-9a-f]{4})/g, (_, group1) => {
    return String.fromCharCode(parseInt(group1, 16));
  });
