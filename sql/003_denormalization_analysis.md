# Denormalization vs integration events

Office staff searching jobs always need a customer name on the list. Joining
`jobs.jobs` to a Contacts table on every keystroke is the normalized option:
one source of truth, no stale names, and a schema that stays small. It is the
right default while both modules share a database and the join stays cheap
(indexed `customer_id` + tenant predicate).

Denormalize `customer_name` onto `jobs.jobs` when the list is read-heavy, the
Contacts bounded context is not in the same database (or cannot be joined in
the same transaction), or the search path has a latency budget that a
cross-module join cannot meet. A roofing dispatcher loading 50 jobs should not
wait on Contacts availability. Copy the name at `JobCreated` time and accept
that a later rename will be stale until a sync runs.

Use integration events to sync that copy rather than a synchronous RPC. When
Contacts publishes `CustomerRenamedIntegrationEvent`, Jobs updates
`customer_name` in its own table. That keeps the Jobs module autonomous: it
does not take a runtime dependency on Contacts’ schema, and Contacts can
change storage without breaking the jobs list. The outbox guarantees the
rename is not lost if Jobs is down; at-least-once delivery plus an
idempotency key (`customerId` + `renamedAt`) prevents double-applies.

The consistency trade-off is explicit. A join is immediately consistent but
couples availability and schemas. Denormalization plus events is eventually
consistent: a renamed customer can appear under the old name for a short
window. That is acceptable for a job board (the crew still finds the house)
and unacceptable for billing legal names, which should be read from Contacts
or copied at invoice generation time with a version stamp. Choose join when
correctness of the latest name matters more than isolation; choose events
when team boundaries and independent deployability matter more than seeing
the rename on the next HTTP response.
