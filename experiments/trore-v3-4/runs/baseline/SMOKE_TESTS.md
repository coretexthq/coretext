# Trore Smoke Testing Manual Guide

This document describes how to manually smoke test the Trore lodging marketplace prototype. Follow these steps to verify all workflows: renter discovery, host management, reviewer/admin auditing, and API authentication.

## 1. Setup & Starting the Application

1. **Reset and Seed the Database:**
   ```bash
   npm run db:reset
   ```
2. **Start the Server:**
   ```bash
   npm start
   ```
3. **Open the App:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 2. Renter Workflow Verification

1. **Select Renter Actor:**
   - In the top header, select **Charlie (Renter)** from the **Active Actor** dropdown.
   - Confirm that the **Saved Searches** section appears in the left sidebar.

2. **Search and Filter Listings:**
   - Type `Bungalow` in the **Keywords** search input. Confirm the list filters down to the Beachside Bungalow.
   - Clear the keywords, select **Beachside** under **District**, and select **2+ Bedrooms**.
   - Verify that URL parameters update automatically (e.g., `?district=Beachside&bedrooms=2&view=grid&page=1`).
   - Press **Save Current Filter State** at the top of the sidebar. Confirm a new entry appears in the "Saved Searches" list.

3. **Map View Sync:**
   - Toggle the **View Mode** to **Map View**.
   - Verify that the map displays pins showing the prices of listings in the current filter results.
   - Click a pin to open the details modal for that listing.
   - Toggle back to **Grid View**.

4. **Listing Details & Nightly Quote:**
   - Click on the **Beachside Bungalow** card to open the details modal.
   - Confirm listing details, amenities, and blackout dates are displayed.
   - Enter booking dates in the Request to Book form: **Check-In: 2026-09-20**, **Check-Out: 2026-09-22**.
   - Confirm that the subtotal is calculated correctly ($200/night * 2 nights = $400).
   - Enter your name and email, and press **Request to Book**.
   - Confirm the success toast notification: "Booking request submitted successfully!"

---

## 3. Host Workflow Verification

1. **Select Host Actor:**
   - In the header, change the **Active Actor** dropdown to **Alice (Host)**.
   - Confirm the interface switches to the **Host Dashboard** showing **Your Listings** and **Booking Requests**.

2. **Create a Listing:**
   - Click **+ Create Listing**.
   - Fill out the modal:
     - Title: `Forest Log Cabin`
     - District: `Forest`
     - Nightly Price: `120`
     - Bedrooms: `1`
     - Amenities: Check *Air Conditioning* and *Pet Friendly*
     - Short Desc: `Charming cabin in the woods`
     - Full Desc: `A beautiful cabin surrounded by tall pines. Quiet retreat.`
   - Press **Save Listing**.
   - Confirm the listing card appears in the grid.

3. **Manage Blackouts:**
   - Click **Manage Blackouts** on the newly created cabin card.
   - Set **Start Date: 2026-08-01**, **End Date: 2026-08-05** and press **Add Date Range**.
   - Verify the blackout range is displayed in the modal list. Close the modal.

4. **Booking Requests Approval / Collisions:**
   - Check the **Booking Requests** sidebar. You should see Charlie's booking request for "Beachside Bungalow" (if Alice owns it, or switch to the matching host if needed).
   - Alice owns Beachside Bungalow. You should see Charlie's request for 2026-09-20 to 2026-09-22.
   - Click **Approve**. Confirm status updates to "approved".
   - *Test Collision Avoidance:* If there were other pending requests overlapping these dates, confirm they automatically transition to "declined".

---

## 4. Reviewer/Admin Workflow Verification

1. **Select Reviewer Actor:**
   - Change the **Active Actor** dropdown to **Reviewer Dan (Reviewer)**.
   - Confirm the view transitions to the **System Audit Logs** dashboard.

2. **Verify Logs:**
   - Verify that all mutations performed in the previous steps are logged:
     - Renter search save action.
     - Renter booking request creation.
     - Host listing creation ("Forest Log Cabin").
     - Host blackout period creation.
     - Host booking approval.
   - Verify that details include Timestamp, Actor ID, Actor Name, Action Type, Entity ID, and descriptive Summary.

---

## 5. API Authentication Verification

Verify that protected backend endpoints reject requests that do not present the correct `X-Trore-Auth` header.

1. **Without Auth Header:**
   - Run the following curl command in your terminal:
     ```bash
     curl -i http://localhost:3000/api/admin/audit-logs
     ```
   - Confirm the response is **`401 Unauthorized`**:
     ```http
     HTTP/1.1 401 Unauthorized
     Content-Type: application/json; charset=utf-8
     ...
     {"error":"Unauthorized"}
     ```

2. **With Wrong Auth Header:**
   - Run the following command:
     ```bash
     curl -i -H "X-Trore-Auth: incorrect-token" http://localhost:3000/api/admin/audit-logs
     ```
   - Confirm the response is **`401 Unauthorized`**.

3. **With Correct Auth Header:**
   - Run the following command:
     ```bash
     curl -i -H "X-Trore-Auth: v3-4-case-study" http://localhost:3000/api/admin/audit-logs
     ```
   - Confirm the response is **`200 OK`** and returns the JSON list of audit logs.
