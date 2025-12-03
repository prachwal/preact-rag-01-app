#!/usr/bin/env node

/**
 * Folder Merger Script
 * Merges all files from a selected folder into a single text file
 * Usage: node merge-folder.js <folder-path> [output-filename]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively get all files from a directory
 * @param {string} dirPath - Path to the directory
 * @param {string[]} fileList - Array to store file paths
 * @returns {string[]} Array of file paths
 */
function getAllFiles(dirPath, fileList = []) {
  try {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip common directories that shouldn't be included
        if (!['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'tmp'].includes(file)) {
          getAllFiles(filePath, fileList);
        }
      } else {
        // Only include text-based files
        const ext = path.extname(file).toLowerCase();
        const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.sass', '.less', '.html', '.htm', '.xml', '.md', '.txt', '.yml', '.yaml', '.sh', '.bash', '.py', '.php', '.java', '.cpp', '.c', '.h', '.cs', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.elm', '.hs', '.ml', '.fs', '.vb', '.lua', '.pl', '.r', '.sql', '.graphql', '.gql'];

        if (textExtensions.includes(ext) || !ext) {
          fileList.push(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return fileList;
}

/**
 * Read file content safely
 * @param {string} filePath - Path to the file
 * @returns {string} File content or error message
 */
function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return `Error reading file: ${error.message}`;
  }
}

/**
 * Merge all files from a folder into a single text file
 * @param {string} folderPath - Path to the folder to merge
 * @param {string} outputFileName - Name of the output file (optional)
 */
function mergeFolder(folderPath, outputFileName = null) {
  // Resolve the folder path
  const absoluteFolderPath = path.resolve(folderPath);

  // Check if folder exists
  if (!fs.existsSync(absoluteFolderPath)) {
    console.error(`Folder does not exist: ${absoluteFolderPath}`);
    process.exit(1);
  }

  // Check if it's actually a directory
  const stat = fs.statSync(absoluteFolderPath);
  if (!stat.isDirectory()) {
    console.error(`Path is not a directory: ${absoluteFolderPath}`);
    process.exit(1);
  }

  console.log(`Scanning folder: ${absoluteFolderPath}`);

  // Get all files
  const files = getAllFiles(absoluteFolderPath);
  console.log(`Found ${files.length} files to merge`);

  if (files.length === 0) {
    console.log('No files found to merge');
    return;
  }

  // Generate output filename
  const folderName = path.basename(absoluteFolderPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFileName = outputFileName || `${folderName}_${timestamp}.txt`;
  const outputPath = path.join(path.dirname(__dirname), 'tmp', defaultFileName);

  // Ensure tmp directory exists
  const tmpDir = path.join(path.dirname(__dirname), 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  console.log(`Merging files into: ${outputPath}`);

  // Create the merged content
  let mergedContent = `MERGED FOLDER CONTENT\n`;
  mergedContent += `Source Folder: ${absoluteFolderPath}\n`;
  mergedContent += `Merge Date: ${new Date().toISOString()}\n`;
  mergedContent += `Total Files: ${files.length}\n`;
  mergedContent += `========================================\n\n`;

  files.forEach((filePath, index) => {
    const relativePath = path.relative(absoluteFolderPath, filePath);
    const fileContent = readFileContent(filePath);

    mergedContent += `FILE ${index + 1}/${files.length}: ${relativePath}\n`;
    mergedContent += `PATH: ${filePath}\n`;
    mergedContent += `SIZE: ${fs.statSync(filePath).size} bytes\n`;
    mergedContent += `========================================\n`;
    mergedContent += fileContent;
    mergedContent += `\n\n========================================\n\n`;
  });

  // Write the merged content to file
  try {
    fs.writeFileSync(outputPath, mergedContent, 'utf8');
    console.log(`✅ Successfully merged ${files.length} files into ${outputPath}`);
    console.log(`📊 Total size: ${mergedContent.length} characters`);
  } catch (error) {
    console.error(`❌ Error writing merged file:`, error.message);
    process.exit(1);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: node merge-folder.js <folder-path> [output-filename]');
  console.log('Examples:');
  console.log('  node merge-folder.js ./src');
  console.log('  node merge-folder.js ./src/components my-components.txt');
  console.log('  node merge-folder.js /path/to/folder');
  process.exit(1);
}

const folderPath = args[0];
const outputFileName = args[1];

mergeFolder(folderPath, outputFileName);