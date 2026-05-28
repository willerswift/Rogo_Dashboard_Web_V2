#!/usr/bin/env node

/**
 * Rogo Partner API - Test Script
 * Automatically logs in, derives the active partnerId, and fetches the product list.
 * 
 * Usage: node test-api.js <email> <password>
 */

const BASE_URL = "https://staging.openapi.rogo.com.vn/api/v2.0";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error("\x1b[31mError: Missing login credentials!\x1b[0m");
    console.log("\nUsage:\n  node test-api.js <email> <password>\n");
    process.exit(1);
  }

  console.log(`\x1b[36m[1/3] Logging in to Staging as ${email}...\x1b[0m`);
  
  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/partner/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!loginRes.ok) {
    const errText = await loginRes.text();
    console.error(`\x1b[31mLogin failed (${loginRes.status}): ${errText}\x1b[0m`);
    process.exit(1);
  }

  const tokens = await loginRes.json();
  const token = tokens.access_token;
  console.log("\x1b[32m✔ Login successful!\x1b[0m");

  // 2. Fetch User Resources & Derive Partner ID
  console.log("\x1b[36m[2/3] Fetching user resources to derive partnerId...\x1b[0m");
  const resourcesRes = await fetch(`${BASE_URL}/partner/user/resources`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!resourcesRes.ok) {
    const errText = await resourcesRes.text();
    console.error(`\x1b[31mFailed to fetch resources (${resourcesRes.status}): ${errText}\x1b[0m`);
    process.exit(1);
  }

  const resources = await resourcesRes.json();
  
  // Parse partner ID from resources using app session logic
  const partnerIds = new Set();
  if (Array.isArray(resources.partnerResources)) {
    for (const r of resources.partnerResources) {
      const parts = r.split(":");
      const id = parts[parts.length - 1];
      if (id) partnerIds.add(id);
    }
  }
  if (Array.isArray(resources.projectResources)) {
    for (const entry of resources.projectResources) {
      if (Array.isArray(entry.resources)) {
        for (const r of entry.resources) {
          const match = r.match(/^partner:([^:]+)/);
          if (match && match[1]) {
            partnerIds.add(match[1]);
          }
        }
      }
    }
  }

  const partnerIdList = Array.from(partnerIds);
  if (partnerIdList.length === 0) {
    console.error("\x1b[31mError: No partnerId found associated with this user account.\x1b[0m");
    console.log("User Resources response:", JSON.stringify(resources, null, 2));
    process.exit(1);
  }

  const partnerId = partnerIdList[0];
  console.log(`\x1b[32m✔ Derived active partnerId: "${partnerId}"\x1b[0m`);
  if (partnerIdList.length > 1) {
    console.log(`  (Found other associated partnerIds: ${partnerIdList.slice(1).map(p => `"${p}"`).join(", ")})`);
  }

  // 3. Fetch Product List
  console.log(`\x1b[36m[3/3] Fetching products for partner "${partnerId}"...\x1b[0m`);
  const productsUrl = `${BASE_URL}/partner/product/list/${partnerId}?page=1&size=20`;
  console.log(`      Request URL: ${productsUrl}`);

  const productsRes = await fetch(productsUrl, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  if (!productsRes.ok) {
    const errText = await productsRes.text();
    console.error(`\x1b[31mFailed to fetch products (${productsRes.status}): ${errText}\x1b[0m`);
    process.exit(1);
  }

  const products = await productsRes.json();
  
  console.log("\n\x1b[32;1m🎉 API Response:\x1b[0m");
  console.log(JSON.stringify(products, null, 2));
}

main().catch(err => {
  console.error("\x1b[31mUnexpected script error:\x1b[0m", err);
});
