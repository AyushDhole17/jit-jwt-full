# KYC Verification Guide

## Overview

The KYC (Know Your Customer) verification system allows bank administrators and managers to verify or reject customer identity documents before they can open accounts and perform banking transactions.

## KYC Verification Workflow

```
Customer Registration
        ↓
KYC Status: pending
        ↓
Admin/Manager Reviews Documents
        ↓
    ┌───────────┐
    ↓           ↓
Verify KYC   Reject KYC
    ↓           ↓
verified    rejected
    ↓           ↓
Can open    Cannot open
accounts    accounts
```

## How to Verify Customer KYC

### Step 1: Access Customer Management

1. Navigate to **Banking** → **Customer Management** from the sidebar
2. The page displays a list of all customers with their KYC status

### Step 2: Identify Pending KYC Customers

Look for customers with these KYC status badges:

- 🟡 **Pending** (Yellow) - New customer, awaiting verification
- 🔵 **In Review** (Blue) - Currently under review
- 🟢 **Verified** (Green) - Already verified ✅
- 🔴 **Rejected** (Red) - Previously rejected

### Step 3: Review Customer Details

For customers with **Pending** or **In Review** status:

1. Click the **👁️ View** icon to see complete customer details
2. Review the following information:
   - **Personal Information**: Name, DOB, Gender, Contact details
   - **Address**: Complete residential address
   - **KYC Documents**: PAN Card & Aadhaar numbers
   - **Banking Information**: Home Branch, Occupation, Annual Income

### Step 4: Verify KYC Documents

Once satisfied with the customer's information:

1. Click the **✓ Green Check Icon** (Verify KYC button)
2. A verification dialog will appear showing:
   - Customer summary
   - PAN Card number
   - Aadhaar number
   - Date of Birth
   - Occupation
   - Complete address
   - Confirmation message
3. Review all details carefully
4. Click **"Verify KYC"** button to confirm

**Result**:

- KYC status changes to ✅ **Verified**
- Customer can now open accounts
- Customer can perform transactions
- Success notification appears

### Step 5: Reject KYC (If Required)

If the customer's documents are incomplete, invalid, or suspicious:

1. Click the **✖️ Red Cancel Icon** (Reject KYC button)
2. A rejection dialog will appear
3. **IMPORTANT**: Enter a detailed rejection reason in the text field
   - Example: "PAN card number format is invalid"
   - Example: "Aadhaar number does not match name"
   - Example: "Address proof incomplete"
   - Example: "Documents are not clear/readable"
4. Click **"Reject KYC"** button

**Result**:

- KYC status changes to ❌ **Rejected**
- Customer cannot open accounts
- Customer is notified with the rejection reason
- Customer can resubmit corrected documents

## KYC Status Meanings

| Status        | Badge Color | Meaning                       | Can Open Account? | Actions Available |
| ------------- | ----------- | ----------------------------- | ----------------- | ----------------- |
| **pending**   | 🟡 Yellow   | New customer, awaiting review | ❌ No             | Verify, Reject    |
| **in_review** | 🔵 Blue     | Under verification process    | ❌ No             | Verify, Reject    |
| **verified**  | 🟢 Green    | KYC approved                  | ✅ Yes            | View only         |
| **rejected**  | 🔴 Red      | KYC rejected with reason      | ❌ No             | View only         |

## KYC Verification Checklist

Before verifying a customer's KYC, ensure:

### ✅ PAN Card Validation

- [ ] Format is correct: `ABCDE1234F` (5 letters, 4 digits, 1 letter)
- [ ] All letters are uppercase
- [ ] Name matches with customer name
- [ ] Not a duplicate (already registered)

### ✅ Aadhaar Validation

- [ ] Exactly 12 digits
- [ ] Valid Aadhaar number format
- [ ] Not a duplicate (already registered)
- [ ] Matches with customer details

### ✅ Personal Information

- [ ] Name is complete (First & Last name required)
- [ ] Email is valid format
- [ ] Mobile number is in correct format: `+91-XXXXXXXXXX`
- [ ] Date of birth is reasonable (18+ years old)

### ✅ Address Information

- [ ] Address Line 1 is provided
- [ ] City and State are provided
- [ ] Pincode is 6 digits
- [ ] Address is complete and verifiable

### ✅ Banking Information

- [ ] Home branch is selected
- [ ] Occupation is specified
- [ ] Annual income is provided and reasonable

## API Endpoints Used

### Verify KYC

```http
POST /api/v1/banking/customers/:customerId/verify-kyc
Content-Type: application/json

{
  "status": "verified"
}
```

### Reject KYC

```http
POST /api/v1/banking/customers/:customerId/verify-kyc
Content-Type: application/json

{
  "status": "rejected",
  "rejectionReason": "Reason for rejection"
}
```

## Permissions Required

To verify KYC, the user must have one of these roles:

- 🔐 **bank_admin** - Full access to all KYC operations
- 🔐 **bank_manager** - Can verify KYC for their branch customers

## Common Scenarios

### Scenario 1: New Customer Registration

1. Customer registers through the system
2. KYC status: **pending**
3. Admin reviews and verifies
4. KYC status: **verified**
5. Customer opens account

### Scenario 2: Invalid Documents

1. Customer registers with wrong PAN format
2. KYC status: **pending**
3. Admin reviews and finds error
4. Admin clicks Reject with reason: "PAN format invalid"
5. KYC status: **rejected**
6. Customer receives notification
7. Customer updates documents
8. Process repeats

### Scenario 3: Duplicate Documents

1. Customer tries to register with existing PAN/Aadhaar
2. System prevents creation: "PAN card already registered"
3. No KYC verification needed

## Best Practices

### ✅ Do's

1. **Review Carefully**: Always review all customer details before verification
2. **Check Duplicates**: Ensure PAN and Aadhaar are not already registered
3. **Be Specific**: When rejecting, provide clear and specific reasons
4. **Verify Format**: Check PAN, Aadhaar, mobile, and pincode formats
5. **Document Review**: Verify that document URLs (if provided) are accessible
6. **Age Verification**: Ensure customer is 18+ years old

### ❌ Don'ts

1. **Don't Rush**: Take time to review each application thoroughly
2. **Don't Approve Incomplete**: Never verify incomplete or suspicious applications
3. **Don't Be Vague**: Avoid generic rejection reasons like "Invalid documents"
4. **Don't Ignore Flags**: Pay attention to system warnings and validation errors

## Troubleshooting

### Issue: "Failed to verify KYC"

**Solution**:

- Check if you have proper permissions (bank_admin or bank_manager role)
- Ensure customer ID is valid
- Check network connection

### Issue: Cannot find Verify/Reject buttons

**Solution**:

- Buttons only appear for customers with **pending** or **in_review** status
- Already verified/rejected customers only show View button
- Check if you have proper permissions

### Issue: "Rejection reason required"

**Solution**:

- When rejecting KYC, you must provide a rejection reason
- Reason must not be empty
- Provide specific and helpful feedback

## Testing with Nagpur Data

Using the seeded Nagpur test data:

1. **10 Customers**: All seeded with KYC status "verified"
2. **To Test Verification**: Create a new customer with pending status
3. **To Test Rejection**: Use the newly created customer

## Impact on Banking Operations

### With Verified KYC ✅

- Can open savings accounts
- Can open current accounts
- Can open fixed deposits
- Can open recurring deposits
- Can apply for loans
- Can request cards
- Can perform transactions

### With Unverified KYC ❌

- Cannot open any accounts
- System shows error: "Customer KYC not verified"
- Must complete KYC verification first
- All banking operations blocked

## Notification Flow

When KYC is verified or rejected, notifications are sent:

### On Verification ✅

```
Subject: KYC Verified Successfully
Message: Your KYC has been verified. You can now open accounts and use our banking services.
```

### On Rejection ❌

```
Subject: KYC Verification Failed
Message: Your KYC has been rejected. Reason: [Rejection Reason]
Please update your documents and resubmit.
```

## Quick Reference

| Action       | Button        | Location       | Result                        |
| ------------ | ------------- | -------------- | ----------------------------- |
| View Details | 👁️ View       | Actions column | Opens customer details dialog |
| Verify KYC   | ✓ Green Check | Actions column | Sets status to "verified"     |
| Reject KYC   | ✖️ Red X      | Actions column | Sets status to "rejected"     |

## Related Documentation

- [Customer Form Fix](./CUSTOMER_FORM_FIX.md) - Customer creation guide
- [Account Creation Fix](./ACCOUNT_CREATION_FIX.md) - Account opening guide
- [RBAC Implementation](./RBAC_IMPLEMENTATION_SUMMARY.md) - Permission system

---

## Summary

**KYC Verification Process**:

1. 📋 Navigate to Customer Management
2. 🔍 Find customers with pending/in_review status
3. 👁️ Review customer details thoroughly
4. ✓ Click Verify (if documents are valid)
   - OR -
5. ✖️ Click Reject with detailed reason (if documents are invalid)
6. ✅ Customer receives notification
7. 🎯 Verified customers can proceed with banking operations

**Remember**: KYC verification is a critical compliance step. Always verify documents carefully to prevent fraud and ensure customer authenticity.

---

**Last Updated**: October 19, 2025  
**Status**: ✅ Active Feature
