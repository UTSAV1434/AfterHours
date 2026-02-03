import * as fs from 'fs';

const csv = fs.readFileSync('src/utils/badWords.csv', 'utf-8');
const lines = csv.split('\n');

console.log('--- Checking CSV format ---');
console.log('Total lines:', lines.length);

// Check for lines with unusual characters
let issueCount = 0;
lines.forEach((line, i) => {
    const cleaned = line.replace(/,/g, '').trim().toLowerCase();

    // Check for double spaces, leading spaces, or special chars
    if (line.includes('  ') || (line.startsWith(' ') && line.trim() !== '')) {
        console.log(`Line ${i + 1} has spacing issue: "${line}"`);
        issueCount++;
    }

    // Check for empty after cleaning
    if (line.trim() !== '' && cleaned === '') {
        console.log(`Line ${i + 1} becomes empty after cleaning: "${line}"`);
        issueCount++;
    }
});

console.log(`\nIssues found: ${issueCount}`);

// Test a few specific words
const badWords = lines.map(w => w.replace(/,/g, '').trim().toLowerCase()).filter(Boolean);

console.log('\n--- Testing specific words ---');
const testWords = ['stupid', 'idiot', 'hate', 'kill', 'abuse', 'violence', 'fuck', 'shit', 'ass'];
testWords.forEach(word => {
    const found = badWords.includes(word);
    console.log(`"${word}" in list: ${found}`);
});

// Check words that contain the test text
console.log('\n--- Words matching "stu" ---');
console.log(badWords.filter(w => w.includes('stu')).slice(0, 10));
