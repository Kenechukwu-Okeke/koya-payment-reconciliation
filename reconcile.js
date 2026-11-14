// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

let total = 0;
let count = 0;

// Latest attempt for each txn_id (the file is not in time order, so compare ts)
const latest = {};

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
for (const line of lines) {
  let event;
  try {
    event = JSON.parse(line);
  } catch (e) {
    continue; // unreadable line, ignore
  }
  if (!event || !event.txn_id) continue; // no txn_id, ignore
  if (!latest[event.txn_id] || event.ts > latest[event.txn_id].ts) {
    latest[event.txn_id] = event;
  }
}

for (const txnId in latest) {
  const event = latest[txnId];
  if (event.status === "success") {
    total += Number(String(event.amount).replace(/,/g, ""));
    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}