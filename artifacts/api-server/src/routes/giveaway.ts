import { Router, type IRouter } from "express";
import { CreateGiveawayEntryBody, CreateGiveawayEntryResponse } from "@workspace/api-zod";
import { db, giveawayEntriesTable } from "@workspace/db";

const router: IRouter = Router();

function normalizeNigerianPhoneNumber(phoneNumber: string): string | null {
  const compact = phoneNumber.replace(/[^\d+]/g, "");

  if (/^\+234\d{10}$/.test(compact)) {
    return compact;
  }

  if (/^0\d{10}$/.test(compact)) {
    return `+234${compact.slice(1)}`;
  }

  if (/^[789]\d{9}$/.test(compact)) {
    return `+234${compact}`;
  }

  return null;
}

router.post("/giveaway/entries", async (req, res): Promise<void> => {
  const parsed = CreateGiveawayEntryBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid giveaway entry");
    res.status(400).json({ error: "Please review the entry details and consent selections." });
    return;
  }

  const phoneNumber = normalizeNigerianPhoneNumber(parsed.data.phoneNumber);

  if (!phoneNumber) {
    res.status(400).json({ error: "Enter a valid Nigerian mobile number." });
    return;
  }

  const [entry] = await db
    .insert(giveawayEntriesTable)
    .values({
      phoneNumber,
      state: parsed.data.state,
      network: parsed.data.network,
      consentToTerms: parsed.data.consentToTerms,
      consentToContact: parsed.data.consentToContact,
    })
    .returning({
      id: giveawayEntriesTable.id,
      createdAt: giveawayEntriesTable.createdAt,
    });

  const response = {
    id: entry.id,
    status: "received" as const,
    reference: `FDS-${entry.id.slice(0, 8).toUpperCase()}`,
    createdAt: entry.createdAt,
  };

  res.status(201).json(CreateGiveawayEntryResponse.parse(response));
});

export default router;