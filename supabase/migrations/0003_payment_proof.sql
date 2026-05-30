-- ============================================================================
-- PlantTree.life — payment proof in thread
-- Adds a new message kind so a donor's payment screenshot can appear as the
-- first piece of evidence in the donor/farmer thread once the operator
-- verifies. donations.payment_proof_key (0001) already exists; this migration
-- is just the messages.kind enum extension.
-- ============================================================================

alter table public.messages
  drop constraint messages_kind_check;

alter table public.messages
  add constraint messages_kind_check check (kind in (
    'text', 'photo', 'thread-open', 'planting', 'milestone', 'payment-proof'
  ));
