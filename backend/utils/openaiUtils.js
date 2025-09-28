const OpenAI = require("openai");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });


async function moderateUserInput (query) {
  // Relevant for both inputs and outputs
  const completion = await openai.moderations.create({
    input: query,
  });
  const { flagged, categories } = completion.results[0];
  console.log("flagged", flagged);
  console.log("categories", categories);

    if (flagged) {
        return renderWarning(categories);
    }

    return null;

}

function renderWarning(obj) {
  const keys = Object.keys(obj);
  const filtered = keys.filter((key) => obj[key]);

return `Your message has been flagged for the following reasons: ${filtered.join(
    ", "
  )}.`;
}

module.exports = moderateUserInput