import * as fs from 'fs';

const csv = fs.readFileSync('src/utils/badWords.csv', 'utf-8');

console.log('Raw file length:', csv.length);
console.log('Has \\r:', csv.includes('\r'));
console.log('Has \\n:', csv.includes('\n'));

// Try different split methods
console.log('\nSplit by \\n:', csv.split('\n').length, 'lines');
console.log('Split by \\r\\n:', csv.split('\r\n').length, 'lines');
console.log('Split by /\\r?\\n/:', csv.split(/\r?\n/).length, 'lines');

// Show first few characters as hex
console.log('\nFirst 50 char codes:');
for (let i = 0; i < 50; i++) {
    console.log(`${i}: '${csv[i]}' (${csv.charCodeAt(i)})`);
}

// Check if properly parsed
const badWords = csv.split(/\r?\n/).map(w => w.replace(/,/g, '').trim().toLowerCase()).filter(Boolean);
console.log('\n\nTotal bad words after fix:', badWords.length);
console.log('First 10 words:', badWords.slice(0, 10));
console.log('Contains fuck:', badWords.includes('fuck'));
