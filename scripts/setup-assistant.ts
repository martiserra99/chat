import OpenAI from "openai";

const client = new OpenAI();

async function main() {
  const vectorStore = await client.vectorStores.create({
    name: "Knowledge Base",
  });

  console.log("\nAdd this to your .env.local:\n");
  console.log(`OPENAI_VECTOR_STORE_ID=${vectorStore.id}`);
}

main().catch(console.error);
