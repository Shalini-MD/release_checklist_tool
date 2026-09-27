const assert = require('assert');
const { calculateStatus } = require('./schema');

console.log("Running Status Calculation Tests...");

// Test 1: 0 completed -> PLANNED
let result = calculateStatus([]);
assert.strictEqual(result, 'PLANNED', '0 completed should be PLANNED');
console.log("✅ Test 1 passed: 0 completed -> PLANNED");

// Test 2: 3 completed out of 7 -> ONGOING
result = calculateStatus([0, 1, 2]);
assert.strictEqual(result, 'ONGOING', '3 completed should be ONGOING');
console.log("✅ Test 2 passed: 3 completed -> ONGOING");

// Test 3: 7 completed -> DONE
result = calculateStatus([0, 1, 2, 3, 4, 5, 6]);
assert.strictEqual(result, 'DONE', '7 completed should be DONE');
console.log("✅ Test 3 passed: 7 completed -> DONE");

console.log("All tests passed successfully! 🎉");
