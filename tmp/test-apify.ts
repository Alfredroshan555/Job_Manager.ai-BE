import { ApifyClient } from "apify-client";
import * as dotenv from "dotenv";
dotenv.config();

async function test() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.error("❌ APIFY_API_TOKEN is missing in .env");
    return;
  }

  const client = new ApifyClient({ token });
  console.log("✅ ApifyClient initialized");

  try {
    console.log('🔍 Testing search with "React Developer"...');
    const input = {
      search_terms: ["React Developer"],
      location: "Kochi, Kerala",
      max_results: 5,
      country: "India",
    };

    const run = await client.actor("jpraRc4MCUh5ehbHV").call(input);
    console.log("✅ Actor run started. Dataset ID:", run.defaultDatasetId);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`✅ Found ${items.length} jobs`);
    console.log("Sample Job:", items[0]?.title || "None");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

test();
