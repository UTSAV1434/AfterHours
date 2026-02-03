import badWordsRaw from './badWords.csv?raw';

const badWords = badWordsRaw.split('\n').map(word => word.replace(/,/g, '').trim().toLowerCase()).filter(Boolean);

export const containsBadWords = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return badWords.some((word) => lowerText.includes(word));
};
