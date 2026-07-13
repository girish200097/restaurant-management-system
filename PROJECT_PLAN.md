# Restaurant Management System - Project Plan

## Project Goal

Build a complete Restaurant Management System using:

* React
* Node.js
* Express.js
* MongoDB
* Email Authentication
* OTP Authentication

---

# Module 1 - Authentication

## Features
Authentication

Features
---------
[ ] QR Code Login
[ ] Email Magic Link
[ ] Email OTP (Backup)
[ ] User Login
[ ] Admin Login
[ ] JWT Authentication
[ ] Logout

Business Rules
--------------
- User must scan QR to order food.
- User opening app directly is treated as an outside customer.
- Outside customers can:
    • View Menu
    • Reserve Table
    • Book Room
- Outside customers cannot order food.

Status:
Planning

---

# Module 2 - Menu

## Features

* [ ] View Menu
* [ ] Add Menu Item
* [ ] Update Menu Item
* [ ] Delete Menu Item
* [ ] Veg Filter
* [ ] Non-Veg Filter
* [ ] Drinks Filter
* [ ] Search Food

Status:
Not Started

---

# Module 3 - Orders

## Features

* [ ] Add to Cart
* [ ] Place Order
* [ ] Extra Order
* [ ] Reorder
* [ ] Order History

Status:
Not Started

---

# Module 4 - Waiter

## Features
Features
---------
[ ] Smart Waiter Assignment
[ ] Call Waiter
[ ] Request Bill
[ ] Transfer Tables

Business Rules
--------------
- Assign waiter only after the first order.
- Assign the least busy waiter.
- Same waiter serves the table until checkout.
Status:
Not Started

---

# Module 5 - Table Reservation

## Features

Reservation

Features
---------
[ ] Login Required
[ ] Select Date
[ ] View Available Time Slots
[ ] Select Number of People
[ ] Restaurant Layout
[ ] Choose Table
[ ] Pay Reservation Fee
[ ] Reservation Confirmation
[ ] Reminder Notification
[ ] Check-In


• Customer must be logged in.

• User first selects:
  - Date
  - Time
  - Number of People

• Backend suggests only tables that can accommodate the selected number of people.

• Customer selects the table from the restaurant layout.

• Reservation requires a reservation fee.

• Reservation fee is configurable by Admin.

• Customer has 5 minutes after booking to cancel.
  - Refund ₹90
  - Restaurant keeps ₹10

• After 5 minutes, the reservation becomes non-refundable.

• Customer has a 30-minute grace period after the reservation time to check in.

• On successful check-in:
  - Reservation becomes Checked-In.
  - Reservation fee is deducted from the final bill.

• If customer does not check in within 30 minutes:
  - Reservation expires.
  - Table becomes available.
Status:
Not Started

---

# Module 6 - Room Booking

## Features

* [ ] Book Room
* [ ] Cancel Booking
* [ ] View Booking History

Status:
Not Started

---

# Module 7 - Payments

## Features

* [ ] Razorpay Integration
* [ ] Payment History
* [ ] Payment Status
Payment

Features
---------
[ ] settle bill
[ ] Email Invoice
[ ] Automatic Logout

Business Rules
--------------
- 
- 
- Session completes only when full payment is received.

Status:
Not Started

# Module 8 - Dining Session
Dining Session

Features
---------
[ ] Create Dining Session
[ ] Join Existing Table
[ ] Close Session

Business Rules
--------------
- One dining session per table.
- Multiple users can join the same table.
- Session ends only after payment.



=========================================
# Future Features (Version 2)
=========================================

Parcel / Takeaway Module
------------------------
Features
---------
[ ] Takeaway Order
[ ] Parcel Dashboard
[ ] Order Status Tracking
[ ] Pickup Confirmation
[ ] Delivery Time Tracking

Order Status
------------
PLACED
↓
PREPARING
↓
READY FOR PICKUP
↓
DELIVERED

Parcel Dashboard
----------------
- Parcel staff can view only takeaway orders.
- Show customer name and ordered items.
- Show current order status.
- "Deliver Parcel" button to complete the order.

Business Rules
--------------
- Only takeaway orders appear in the Parcel Dashboard.
- Clicking "Deliver Parcel" changes the order status to DELIVERED.
- Delivery time is stored in the database.
- Admin can view all parcel order statuses.
- Customer can track the takeaway order status in the app.

Future Improvements
-------------------
[ ] Pickup verification code before handing over the parcel.
[ ] Notification to customer when the order is READY.
[ ] Search takeaway orders by Order ID or customer name.
[ ] Parcel sales analytics for admin.