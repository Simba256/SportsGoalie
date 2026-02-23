# Canadian Privacy Compliance for SportsGoalie

## Overview

SportsGoalie serves users aged 6+, which means we must comply with Canadian privacy laws (PIPEDA) with special considerations for children.

---

## Key Age Thresholds

| Age Range | Consent Requirement | Notes |
|-----------|---------------------|-------|
| **Under 13** | Parental consent required | Must verify parent identity and relationship |
| **13-17** | Evolving capacity | Assess if child can meaningfully consent |
| **18+** | Full consent | Standard adult consent |

**Quebec Note:** Quebec recommends digital age of majority at 14 for social media. Consider this for Phase 8 social features.

---

## Required Implementation

### 1. Age Verification on Registration

**For Students:**
```
- Collect date of birth during registration
- If under 13: Require parent/guardian account to be created first
- If 13-17: Show age-appropriate consent, allow parent linking
- If 18+: Standard registration flow
```

**Implementation:**
- Add `dateOfBirth` field to registration (required)
- Calculate age and route to appropriate flow
- Store age bracket for compliance tracking

---

### 2. Parental Consent for Under-13

**Requirements:**
- Parent must create account first
- Parent explicitly consents to child's account creation
- Verify parent-child relationship (attestation is acceptable)
- Parent can revoke consent at any time

**Implementation:**
- Parent registration flow collects consent acknowledgments
- Child registration requires parent account link
- Parent dashboard includes consent management
- Store consent timestamps and version

---

### 3. Privacy by Default Settings

**Required Defaults (all ages):**

| Setting | Default | User Can Change? |
|---------|---------|------------------|
| Profile visibility | Private | Yes (13+ only) |
| Progress sharing | Off | Yes |
| Location tracking | Off | Not needed |
| Ad targeting | Off | N/A (no ads) |
| Data for AI training | Off | Admin only |

**Implementation:**
- Default `UserPreferences` to most private settings
- Under-13 cannot change visibility to public
- Parents control child's sharing settings

---

### 4. Data Minimization

**Collect Only What's Necessary:**

| Data | Purpose | Retention |
|------|---------|-----------|
| Email | Authentication, communication | Account lifetime |
| Name | Identification | Account lifetime |
| Date of birth | Age verification, compliance | Account lifetime |
| Progress data | Core functionality | Account lifetime |
| Video uploads | Training analysis | User-controlled deletion |
| Evaluation scores | Placement, tracking | Account lifetime |
| Charting data | Performance tracking | Account lifetime |

**What NOT to Collect:**
- Precise location (not needed)
- Device identifiers beyond session
- Browsing history outside app
- Social media connections (until Phase 8)

---

### 5. Transparency Requirements

**Privacy Policy Must Include:**
- What data we collect and why
- How long we keep it
- Who we share it with (coaches, parents)
- How to request deletion
- Contact information

**Age-Appropriate Notices:**
- Simple language version for under-13
- Visual/interactive explanation option
- No legal jargon in primary notices

**Implementation:**
- Create kid-friendly privacy summary
- Show relevant notice during registration based on age
- Link to full policy from all notices

---

### 6. Parental Controls & Access

**Parents Must Be Able To:**
- View all child's data
- Download child's data
- Request deletion of child's data
- Revoke consent (delete account)
- Control sharing settings
- View coach communications

**Implementation:**
- Parent dashboard with full visibility
- Data export feature (JSON/CSV)
- Account deletion workflow
- Consent revocation flow

---

### 7. Data Deletion Rights

**Requirements:**
- Users can request deletion of their data
- Parents can delete child's data
- Deleted data must be removed within reasonable time
- Backups should be purged within 30 days

**Implementation:**
- Add "Delete Account" to settings
- Soft delete → hard delete after 30 days
- Cascade delete all related data
- Document deletion in audit log

---

### 8. No Deceptive Design

**Prohibited Patterns:**
- Dark patterns that discourage privacy choices
- Confusing language
- Nagging to enable tracking
- Making privacy options hard to find

**Required:**
- Equal visual weight for all choices
- Clear, simple language
- Easy to find privacy settings
- No guilt-tripping for privacy choices

---

## Implementation Phases

### Phase 2 (Required Before Launch)

- [ ] Date of birth collection on registration
- [ ] Age-based registration routing
- [ ] Parental consent for under-13
- [ ] Privacy by default settings
- [ ] Basic privacy policy
- [ ] Kid-friendly privacy summary

### Phase 4 (Parent Dashboard)

- [ ] Full child data visibility
- [ ] Consent management UI
- [ ] Data export feature

### Phase 6 (Production Hardening)

- [ ] Account deletion workflow
- [ ] Data retention audit
- [ ] Privacy policy review
- [ ] Compliance documentation

### Phase 8 (Social Features)

- [ ] Quebec age-14 consideration for social
- [ ] Enhanced sharing controls
- [ ] Public profile restrictions for minors

---

## Consent Records to Store

```typescript
interface ConsentRecord {
  userId: string;
  consentType: 'registration' | 'parent_for_child' | 'data_sharing' | 'video_upload';
  version: string; // Policy version consented to
  consentedAt: Timestamp;
  consentedBy: string; // User ID (parent for child consent)
  ipAddress?: string;
  revokedAt?: Timestamp;
}

interface UserCompliance {
  userId: string;
  dateOfBirth: Date;
  ageAtRegistration: number;
  isMinor: boolean;
  parentalConsentRequired: boolean;
  parentalConsentGiven: boolean;
  parentUserId?: string;
  consentRecords: string[]; // ConsentRecord IDs
}
```

---

## Privacy Policy Checklist

- [ ] Identity and contact of data controller
- [ ] Types of personal data collected
- [ ] Purposes of data processing
- [ ] Legal basis for processing
- [ ] Data retention periods
- [ ] Third-party sharing (coaches, parents)
- [ ] User rights (access, deletion, correction)
- [ ] How to exercise rights
- [ ] Complaint process
- [ ] Children's data handling
- [ ] Parental consent process
- [ ] Updates notification process

---

## Sources

- [PIPEDA Compliance Guide](https://geotargetly.com/blog/pipeda-compliance-guide-to-canada-privacy-law)
- [Canada's Children's Privacy Framework](https://www.osler.com/en/insights/updates/insights-into-canadas-development-of-childrens-privacy-framework/)
- [OPC Children's Privacy Code Consultation](https://www.priv.gc.ca/en/about-the-opc/what-we-do/consultations/completed-consultations/consultation-children-code/expl_children-code/)
- [Canadian Privacy Commissioner Report on Educational Apps](https://www.hunton.com/privacy-and-information-security-law/canadian-privacy-commissioner-issues-report-childrens-educational-apps)

---

## Summary

For a Canadian app serving children 6+:

1. **Under 13**: Always require parental consent first
2. **Privacy by default**: Most restrictive settings enabled
3. **Data minimization**: Only collect what's needed
4. **Transparency**: Kid-friendly explanations
5. **Parental control**: Full visibility and control
6. **Deletion rights**: Must honor deletion requests
7. **No dark patterns**: Clear, honest UI
