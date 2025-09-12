// Script to remove maxRetries from withPrisma options
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get a list of all API files using grep
const grepCommand = "grep -r 'maxRetries:' --include='*.ts' ./src/app/api/";
let filesToFix = [];

try {
  const grepResult = execSync(grepCommand, { cwd: process.cwd() }).toString();

  // Extract file paths from grep result
  const lines = grepResult.split('\n').filter(Boolean);

  lines.forEach((line) => {
    const filePath = line.split(':')[0];
    if (!filesToFix.includes(filePath)) {
      filesToFix.push(filePath);
    }
  });

  console.log(`Found ${filesToFix.length} files with maxRetries option`);

  // Process each file
  filesToFix.forEach((filePath) => {
    console.log(`Processing ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Use regex to find and remove maxRetries property
    // This matches maxRetries: <number>, or maxRetries: <number> followed by a comment
    const regex = /,?\s*maxRetries:\s*\d+(\s*\/\/[^\n]*)?/g;
    const newContent = content.replace(regex, '');

    // Write the modified content back to the file
    fs.writeFileSync(filePath, newContent);
    console.log(`Fixed ${filePath}`);
  });

  console.log('All files processed successfully');
} catch (error) {
  console.error('Error running fix script:', error);
  process.exit(1);
}
