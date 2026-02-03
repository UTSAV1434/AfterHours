import badWordsRaw from './badWords.csv?raw';

// Split by both \r\n (Windows) and \n (Unix) line endings
const badWords = badWordsRaw.split(/\r?\n/).map(word => word.replace(/,/g, '').trim().toLowerCase()).filter(Boolean);

export const containsBadWords = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return badWords.some((word) => lowerText.includes(word));
};
