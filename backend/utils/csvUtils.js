const csv = require("csv-parser");
const fs = require("fs");

function stripQuotes(str) {
  if (!str) return "";
  str = str.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
  }
  return str;
}

function normalizeRow(row) {
  const question = stripQuotes(row.question ?? row.q ?? "");
  const answer = stripQuotes(row.answer ?? row.a ?? "");
  const source = "csv";
  return { question, answer, source };
}


function detectSeparator(filePath) {
  const firstLine = fs.readFileSync(filePath, "utf-8").split("\n")[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return commaCount > semicolonCount ? "," : ";";
}

function parseCSV(filePath) {
  // Clean BOM / invalid chars once before parsing
  // let content = fs.readFileSync(filePath, "utf8").replace(/\uFFFD/g, "");
  // fs.writeFileSync(filePath, content);

  const separator = detectSeparator(filePath);
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(
        csv({
          separator,
          quote: '"', // important for Greek question marks
          mapHeaders: ({ header }) => header.replace(/^\ufeff/, "").trim().toLowerCase(),
        })
      )
      .on("data", (row) => {
        const normalized = normalizeRow(row);
        results.push(normalized);
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

module.exports = { parseCSV };
