// Pre-auth persona constants — used by /donor and /farmer routes until real auth lands.
// When auth ships, replace these with `getCurrentDonorId()` / `getCurrentFarmerId()`
// that read from the `profiles` table for the current session.

export const PERSONA_DONOR_ID = "00000000-0000-0000-0000-000000000001"; // Aditya
export const PERSONA_FARMER_ID = "sunita";
