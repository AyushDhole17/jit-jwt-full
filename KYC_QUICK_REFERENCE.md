# Quick KYC Verification Reference

## How to Verify Customer KYC

### Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│         Customer Management Page                        │
├─────────────────────────────────────────────────────────┤
│ Customer ID │ Name       │ Email  │ KYC Status │ Actions│
├─────────────────────────────────────────────────────────┤
│ CUST000001 │ Rajesh     │ raj@.. │ [Pending]  │ 👁️ ✓ ✖️│
│ CUST000002 │ Priya      │ pri@.. │ [Verified] │ 👁️     │
│ CUST000003 │ Amit       │ ami@.. │ [Rejected] │ 👁️     │
└─────────────────────────────────────────────────────────┘
                                           │
                                           │ Click ✓ (Verify)
                                           ↓
┌─────────────────────────────────────────────────────────┐
│              Verify KYC Dialog                          │
├─────────────────────────────────────────────────────────┤
│  Customer: Rajesh Sharma                                │
│  Customer ID: CUST000001                                │
│  Email: rajesh.sharma@example.com                       │
│  Mobile: +91-9876543210                                 │
│                                                          │
│  KYC Documents:                                         │
│  • PAN Card: ABCDE1234F                                 │
│  • Aadhaar: 123456789012                                │
│  • DOB: 15/01/1990                                      │
│  • Occupation: Salaried                                 │
│  • Address: 123 MG Road, Mumbai, MH - 400001           │
│                                                          │
│  ✓ Are you sure you want to verify this KYC?          │
│                                                          │
│                      [Cancel] [Verify KYC ✓]           │
└─────────────────────────────────────────────────────────┘
```

## 3 Simple Steps

### Step 1: Find Pending Customers

Look for 🟡 **Pending** or 🔵 **In Review** badges in the KYC Status column

### Step 2: Review Details

Click 👁️ **View** icon to see complete customer information including:

- Personal details
- PAN & Aadhaar numbers
- Address
- Banking information

### Step 3: Take Action

- Click ✓ **Green Check** → Verify KYC → Customer can open accounts ✅
- Click ✖️ **Red X** → Reject KYC → Enter reason → Customer notified ❌

## Status Colors

| Badge     | Status    | Meaning           |
| --------- | --------- | ----------------- |
| 🟡 Yellow | Pending   | New, needs review |
| 🔵 Blue   | In Review | Being processed   |
| 🟢 Green  | Verified  | Approved ✅       |
| 🔴 Red    | Rejected  | Denied ❌         |

## Quick Checks Before Verifying

✅ PAN format: `ABCDE1234F` (5 letters, 4 digits, 1 letter)  
✅ Aadhaar format: `123456789012` (12 digits)  
✅ Mobile format: `+91-9876543210`  
✅ Complete address provided  
✅ Age 18+ years  
✅ All required fields filled

## When to Reject

Use ✖️ Reject button if:

- Invalid PAN/Aadhaar format
- Duplicate documents
- Incomplete information
- Suspicious details
- Age below 18

**Always provide a clear rejection reason!**

---

💡 **Tip**: Newly created customers start with "pending" status. Use the Verify button to approve them for banking services.

🔒 **Permission**: You need `bank_admin` or `bank_manager` role to verify KYC.
