DATA EXPORT NOTES
=================
Included (non-sensitive):
- products.json        2 product records (full catalog content; created_by_id removed)
- promotions.json      0 promotion/coupon records
- store-settings.json  1 store settings record (bank name, account name, account number
                       and payment instructions BLANKED for safety — re-enter them after migration)

Deliberately NOT included (contains customer personal data):
- Order records (4 exist in the live app)
- Review records (2 exist in the live app)

These must be exported by you from the Base44 dashboard (Data / entities view) if you need to
migrate historical orders and customer reviews. They contain names, phone numbers, addresses
and email addresses — do not put them in a public repository.

Entity schemas (the data model) are fully included under base44/entities/*.jsonc.
