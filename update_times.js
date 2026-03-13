const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/labKnowledge.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all time declarations that are NOT "12-48 Hours (Max)" with "6-8 hours"
// Also support Hindi versions like "6-8 घंटे" if wanted, but the user requested "6-8 hours". Let's use "6-8 hours".
content = content.replace(/time: "(.*?)"/g, (match, p1) => {
    if (p1 === "12-48 Hours (Max)") {
        return match; // leave alone
    }
    return `time: "6-8 hours"`;
});

fs.writeFileSync(filePath, content);
console.log('Successfully updated timings in labKnowledge.js');
