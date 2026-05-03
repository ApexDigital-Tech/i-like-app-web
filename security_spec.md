# Security Specification - MOGUL.OS

## Data Invariants
1. A **Property** must have a valid `ownerId` matching the creator's UID.
2. A **PropertyRequest** must have a valid `userId` matching the creator's UID.
3. A **UserProfile** document ID must match the user's UID.
4. Users can only edit their own profile, properties, and requests.
5. Admins can edit anything (if implemented).
6. `createdAt` fields are immutable after creation.
7. `price`, `budget`, `beds`, etc., must be positive numbers.

## The Dirty Dozen (Payload Attacks)
1. **Identity Spoofing (Property)**: Create a property with someone else's `ownerId`.
2. **Identity Spoofing (Request)**: Create a request with someone else's `userId`.
3. **Privilege Escalation**: Update own `UserProfile` to set `role: "Admin"`.
4. **Ghost Field Injection**: Add `isVerified: true` to a property during update.
5. **Orphaned Record**: Create a property without an `ownerId`.
6. **Immutable Field Modification**: Change `createdAt` on a property update.
7. **Cross-User Profile Edit**: Authenticated user A tries to update user B's profile.
8. **PII Leak**: Unauthorized user tries to 'get' private user details. (Though profiles are mostly public here).
9. **Resource Poisoning**: Inject a 1MB string into the property `description`.
10. **State Shortcutting**: (Not applicable yet, but maybe `valuationTrend` manipulation).
11. **Denial of Wallet**: Infinite `list` query on properties if rules were too broad.
12. **Null Pointer Trigger**: Update a property with `request.resource.data` which is null (rules error).

## Red Team Audit Pass Criteria
- All write operations must use `isValid[Entity]()`.
- `allow update` must use `.diff().affectedKeys().hasOnly()`.
- `allow list` must check `resource.data` to prevent scraping.
