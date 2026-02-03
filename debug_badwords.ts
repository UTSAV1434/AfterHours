import * as fs from 'fs';
import * as path from 'path';

const csvPath = path.join(__dirname, 'src/utils/badWords.csv');
const badWordsRaw = fs.readFileSync(csvPath, 'utf-8');

// Parse exactly like badWords.ts does
const badWords = badWordsRaw.split('\n').map(word => word.replace(/,/g, '').trim().toLowerCase()).filter(Boolean);

console.log(`Total bad words loaded: ${badWords.length}`);
console.log('First 10 words:', badWords.slice(0, 10));
console.log('Last 10 words:', badWords.slice(-10));

// Test specific words that should be blocked
const testWords = ['badword', 'a55', 'stupid', 'idiot', 'kill', 'hate'];

testWords.forEach(word => {
    const isBlocked = badWords.includes(word);
    console.log(`"${word}" in list: ${isBlocked}`);
});

// Test the containsBadWords function
const containsBadWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return badWords.some((word) => lowerText.includes(word));
};

const testPhrases = [
    'Hello world',
    'You are stupid',
    'This is a55',
    'I hate you',
    'Nice day',
    'Idiot person'
];

console.log('\n--- Testing phrases ---');
testPhrases.forEach(phrase => {
    const blocked = containsBadWords(phrase);
    console.log(`"${phrase}": ${blocked ? 'BLOCKED' : 'ALLOWED'}`);
});

// Check for carriage return issues
console.log('\n--- Checking for \\r characters ---');
const wordsWithCR = badWords.filter(word => word.includes('\r'));
console.log(`Words with \\r: ${wordsWithCR.length}`);
if (wordsWithCR.length > 0) {
    console.log('Sample words with CR:', wordsWithCR.slice(0, 5).map(w => JSON.stringify(w)));
}
