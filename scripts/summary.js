const fs = require('fs');
const path = require('path');

// Define input and output directories
const inputDir = path.join('src/engix/src');
const outputFile = path.join('outputs/output.txt');

// Function to concatenate all .ts files into output file
function concatenateFiles() {
    // Clear the output file or create it if it doesn't exist
    fs.writeFileSync(outputFile, '');

    // Read all files from the input directory
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Error reading input directory:', err);
            return;
        }

        files.forEach((file) => {
            // Check if the file has a .ts extension
            if (path.extname(file) === '.ts') {
                const filePath = path.join(inputDir, file);

                // Read the content of the file
                const content = fs.readFileSync(filePath, 'utf8');

                // Append file name as a header and the file content to the output file
                fs.appendFileSync(outputFile, `//File: /${inputDir}/${file}\n\n${content}\n`);
            }
        });

        console.log(`All TypeScript files have been concatenated into ${outputFile}`);
    });
}

// Execute the function
concatenateFiles();
