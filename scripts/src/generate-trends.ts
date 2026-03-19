import { db, pollsTable, pollOptionsTable, pollSnapshotsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

async function generateTrends() {
  console.log("Generating poll trend snapshots...");

  const polls = await db.select().from(pollsTable);
  const allOptions = await db.select().from(pollOptionsTable);

  const optionsByPoll = new Map<number, typeof allOptions>();
  for (const opt of allOptions) {
    if (!optionsByPoll.has(opt.pollId)) optionsByPoll.set(opt.pollId, []);
    optionsByPoll.get(opt.pollId)!.push(opt);
  }

  const WEEKS = 10;
  const now = new Date();
  const snapshots: Array<{
    pollId: number;
    optionId: number;
    snapshotDate: Date;
    percentage: number;
    voteCount: number;
  }> = [];

  const seeded = (seed: number) => {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  };

  for (const poll of polls) {
    const options = optionsByPoll.get(poll.id) ?? [];
    if (options.length < 2) continue;

    const totalVotes = options.reduce((s, o) => s + o.voteCount, 0);
    if (totalVotes === 0) continue;

    const finalPcts = options.map(o => (o.voteCount / totalVotes) * 100);
    const equalPct = 100 / options.length;

    for (let w = 0; w <= WEEKS; w++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (WEEKS - w) * 7);
      const t = w / WEEKS;

      options.forEach((opt, i) => {
        const base = equalPct + (finalPcts[i] - equalPct) * t;
        const noise = (seeded(poll.id * 100 + opt.id + w * 13) - 0.5) * 4 * (1 - t);
        const raw = Math.max(1, base + noise);
        snapshots.push({
          pollId: poll.id,
          optionId: opt.id,
          snapshotDate: date,
          percentage: Math.round(raw * 10) / 10,
          voteCount: Math.round((raw / 100) * totalVotes),
        });
      });
    }
  }

  if (snapshots.length === 0) {
    console.log("No snapshots to insert.");
    return;
  }

  await db.delete(pollSnapshotsTable);
  const BATCH = 500;
  for (let i = 0; i < snapshots.length; i += BATCH) {
    await db.insert(pollSnapshotsTable).values(snapshots.slice(i, i + BATCH));
  }

  console.log(`Inserted ${snapshots.length} snapshots for ${polls.length} polls.`);
  process.exit(0);
}

generateTrends().catch(e => { console.error(e); process.exit(1); });
