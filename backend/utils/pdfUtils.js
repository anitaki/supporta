const fs = require('fs');
const pdf = require('pdf-parse');


/**
 * Extract text content from a PDF file.
 *
 * @param {string} filePath - The path to the PDF file.
 * @returns {Promise<string>} A promise that resolves to the extracted text from the PDF.
 */
async function extractTextFromPdf (filePath) {
let dataBuffer = fs.readFileSync(filePath);
const data = await pdf(dataBuffer)
console.log("🚀 ~ extractTextFromPdf ~ data:", data)
return data.text
}


/**
 * Split a text into smaller chunks by sentences, respecting a maximum length.
 *
 * @param {string} text - The text to be chunked.
 * @param {number} [maxLength=800] - Maximum length of each chunk.
 * @returns {string[]} An array of text chunks.
 */
function chunkText(text, maxLength = 2000) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";

  for (let sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current.trim());
      current = "";
    }
    current += " " + sentence;
  }

  // push leftover text to chunks
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}


module.exports = {extractTextFromPdf, chunkText}

