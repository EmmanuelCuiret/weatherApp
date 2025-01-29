const assert = require('assert');

function isAcceptablePassword(password) {
   if (password.length > 6) {
      let hasDigit = false;
      let hasNonDigit = false;

      for (const char of password) {
         if (!isNaN(char) && char !== ' ') {
            //console.log('car : ' + char);
            hasDigit = true;
         } else {
            //console.log('num : ' + char);
            hasNonDigit = true;
         }
         if (hasDigit && hasNonDigit) {
            return true;
         }
      }
   }
   return false;
}

console.log("Example:");
console.log(isAcceptablePassword("muchlonger5"));

// These "asserts" are used for self-checking
assert.strictEqual(isAcceptablePassword("short"), false);
assert.strictEqual(isAcceptablePassword("muchlonger"), false);
assert.strictEqual(isAcceptablePassword("ashort"), false);
assert.strictEqual(isAcceptablePassword("muchlonger5"), true);
assert.strictEqual(isAcceptablePassword("sh5"), false);
assert.strictEqual(isAcceptablePassword("1234567"), false);

console.log("Coding complete? Click 'Check Solution' to earn rewards!");
