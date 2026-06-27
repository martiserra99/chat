import OpenAI from "openai";
import fs from "fs";

const client = new OpenAI();
const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

async function main() {
  if (!vectorStoreId) {
    console.error("OPENAI_VECTOR_STORE_ID is not set in your environment.");
    process.exit(1);
  }

  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/upload-file.ts <path-to-file>");
    process.exit(1);
  }

  const uploaded = await client.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  await client.vectorStores.files.create(vectorStoreId, {
    file_id: uploaded.id,
  });

  console.log(`Uploaded "${filePath}" to vector store.`);
}

main().catch(console.error);
