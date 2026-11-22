// Test script to verify NLP parser edge cases
import { MultilingualNLPParser } from './src/services/nlpParser.ts';

const parser = new MultilingualNLPParser();

console.log('--- 1. Testing Hindi Multi-Item Parsing ---');
const res1 = parser.processVoiceInput('Arre aaj sabzi pe 120 aur auto ka 60 diya');
console.log('Detected Language:', res1.detectedLanguage);
console.log('Cleaned Fillers:', res1.fillersRemoved);
console.log('Items:', res1.items.map(i => `${i.item} (₹${i.amount}, ${i.category})`));

console.log('\n--- 2. Testing Gujarati Multi-Item Parsing ---');
const res2 = parser.processVoiceInput('Aaje shaak na 120 ane auto na 60 aapya');
console.log('Detected Language:', res2.detectedLanguage);
console.log('Items:', res2.items.map(i => `${i.item} (₹${i.amount}, ${i.category})`));

console.log('\n--- 3. Testing Rajasthani Multi-Item Parsing ---');
const res3 = parser.processVoiceInput('Aaj saag ra 120 ar auto ra 60 diya');
console.log('Detected Language:', res3.detectedLanguage);
console.log('Items:', res3.items.map(i => `${i.item} (₹${i.amount}, ${i.category})`));

console.log('\n--- 4. Testing Mid-Sentence Self-Correction ---');
const res4 = parser.processVoiceInput('Bhaiya 120... nahi nahi 150 sabzi ka likho');
console.log('Corrections:', res4.midSentenceCorrections);
console.log('Items:', res4.items.map(i => `${i.item} (₹${i.amount}, ${i.category})`));

console.log('\n--- 5. Testing Voice Navigation ---');
const res5 = parser.processVoiceInput('Budget kholo');
console.log('Intent:', res5.intent, 'Target:', res5.navigationTarget);

const res6 = parser.processVoiceInput('Report dikhao aur suna do');
console.log('Intent:', res6.intent, 'Target:', res6.navigationTarget);
