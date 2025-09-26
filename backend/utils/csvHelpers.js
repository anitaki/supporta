const csv = require("csv-parser");
const fs = require("fs");

const path = require("path");

const results = [];

/**
 * Normalize a single CSV row: map headers, trim, add default source
 * @param {Object} row
 * @returns {Object} { question, answer, source }
 */
function normalizeRow(row) {
  const question = row.question ?? row.q ?? ""; // ?? Returns the first value that is NOT null or undefined.
  const answer = row.answer ?? row.a ?? "";
  const source = "csv"; // default source
  return { question: question.trim(), answer: answer.trim(), source };
}

/**
 * Auto-detect CSV separator from first line
 * @param {string} filePath
 * @returns {string} separator
 */
function detectSeparator(filePath) {
  const firstLine = fs.readFileSync(filePath, "utf-8").split("\n")[0];
  const commaCount = (firstLine.match(/,/g) || []).length; //match returns an array of all commas found in the string
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return commaCount > semicolonCount ? "," : ";";
}

/**
 * Parse CSV file into normalized rows
 * @param {string} filePath
 * @returns {Promise<Array>} normalized rows
 */
function parseCSV(filePath) {
  // Clean BOM / invalid chars once before parsing
  let content = fs.readFileSync(filePath);
  content = content.toString("utf8").replace(/\uFFFD/g, "");
  fs.writeFileSync(filePath, content);

  const results = [];
  const separator = detectSeparator(filePath);

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      // pipe into csv-parser (transform stream)
      .pipe(
        csv({
          separator,
          mapHeaders: ({ header }) =>
            header
              .replace(/^\ufeff/, "") // remove BOM
              .trim()
              .toLowerCase(),
        })
      )
      .on("data", (data) => {
        const normalizedData = normalizeRow(data);
        const fileBuffer = fs.readFileSync(filePath);
        const content = fileBuffer.toString("utf8").replace(/\uFFFD/g, "");
        fs.writeFileSync(filePath, content);
        results.push(normalizedData);
      })
      .on("end", () => {
        resolve(results);
      })
      .on("error", (err) => reject(err));
  });
}

module.exports = { parseCSV };
