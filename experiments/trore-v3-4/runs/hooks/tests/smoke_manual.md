# Trore Lodging Marketplace Manual Smoke Test Guide

This document outlines the step-by-step manual walkthroughs for verifying Renter, Host, and Reviewer workflows using the interactive web interface at [http://localhost:3000](http://localhost:3000).

---

## 👥 Setup & Verification environment
1. Ensure the server is seeded and running:
   ```bash
   npm run seed
   npm start
   ```
2. Open a web browser and navigate to [http://localhost:3000](http://localhost:3000).
3. The UI features a header bar with a **User Role Switcher** at the top right, allowing you to cycle between **Renter**, **Host**, and **Reviewer (Admin)** modes.

---

## 🔍 Walkthrough 1: Renter Discovery and Bookings

### Goal: Test listing search, filters, URL-state recovery, saved searches, and booking request validation.

#### Step 1: Browse and Search
1. In the User Role Switcher, select **Renter (Emma Watson)**.
2. In the Search bar, type `Modern` and press Enter or click Search.
   - **Expected**: The listing cards filter down to show only the "Sleek Modern Loft in Downtown".
   - **URL Check**: The address bar updates to: `http://localhost:3000/?q=Modern&view=grid` (or similar query parameters).
3. Clear the search input and click Search.

#### Step 2: Apply Filters
1. Select the **Downtown** district from the District filter dropdown.
2. Set the Bedroom count filter to `2 Bedrooms+`.
3. Select the **pool** and **parking** checkboxes in the Amenities section.
   - **Expected**: The list displays only listings matching all criteria (e.g. "Sleek Modern Loft in Downtown").
4. Switch to **Map View** using the toggle button next to the search bar.
   - **Expected**: The grid is replaced by a map placeholder displaying pins representing the filtered result set.
5. Reload the browser page.
   - **Expected**: The filters (Downtown, 2+ bedrooms, pool, parking, Map View) remain active and the page loads the identical matching results, demonstrating URL-driven query parameter binding.

#### Step 3: Save and Reopen Search
1. With the filters still active, click the **Save Search** button next to the search bar.
2. Enter a label for the search (e.g., `Downtown Loft with Pool`) when prompted and save.
   - **Expected**: A toast notification reads "Saved search recorded", and the new search is appended under the **Saved Searches** sidebar section.
3. Reset all filters manually to show all active listings.
4. Click the newly saved search `Downtown Loft with Pool` under the sidebar.
   - **Expected**: The search parameters are instantly restored, the URL updates, and the Downtown loft listing is filtered.

#### Step 4: Listing Details and Pricing Quote
1. Click the **View Details** button on the "Sleek Modern Loft in Downtown" card.
   - **Expected**: A listing detail modal appears showing full information, host name (Alice Vance), list of amenities, and availability details.
2. Select a valid date range (e.g., `2026-07-06` to `2026-07-09` - 3 nights).
   - **Expected**: A price quote is calculated automatically in real time (e.g., `3 nights x $150.00 = $450.00`).

#### Step 5: Booking Request and Validations
1. Attempt to enter check-in/check-out dates matching the listing's blackout dates (`2026-07-10` to `2026-07-15`) and click **Submit Booking Request**.
   - **Expected**: An error alert or validation message is displayed indicating: "Dates overlap with host blackout dates."
2. Enter a valid range (e.g., `2026-07-06` to `2026-07-09`) and click **Submit Booking Request**.
   - **Expected**: A toast notification reports "Booking request created successfully". The modal closes.

---

## 🏡 Walkthrough 2: Host Operations & Listing Management

### Goal: Create and publish listings, manage blackout dates, review booking requests, and verify backend ownership enforcement.

#### Step 1: Manage and Publish Listings
1. In the User Role Switcher, switch to **Host (Alice Vance)**.
   - **Expected**: The view transitions to the Host dashboard showing Alice's owned listings: "Sleek Modern Loft in Downtown" and "Historic Brownstone Suite".
2. Click **Create New Listing**.
3. Fill out the form details:
   - **Title**: `Cozy Waterfront Studio`
   - **District**: `North End`
   - **Nightly Price**: `110`
   - **Bedrooms**: `1`
   - **Amenities**: Check `air conditioning` and `workspace`
   - **Description**: `Charming waterfront studio with scenic views.`
   - **Status**: Select `Draft (Unpublished)`
4. Click **Create Listing**.
   - **Expected**: The new listing is added to Alice's listings list in `Draft` status.
5. In the listings card, click the **Publish** button for `Cozy Waterfront Studio`.
   - **Expected**: The status changes to `Active`. Switch back to **Renter** mode, search for `Waterfront`, and verify that the listing now appears in Renter search results.

#### Step 2: Manage Blackout Dates
1. In **Host (Alice Vance)** mode, click **Manage Availability** on the `Sleek Modern Loft` listing card.
   - **Expected**: An availability editor modal opens showing the existing blackout dates.
2. Add a new blackout date range: `2026-08-01` to `2026-08-05`, then click **Add Blackout**.
   - **Expected**: The blackout is added to the list.
3. Switch to **Renter** mode, open details for the `Sleek Modern Loft`, and verify that the calendar availability lists the new blackout period.

#### Step 3: Booking Request Review
1. In **Host (Alice Vance)** mode, locate the **Booking Requests for Your Listings** table.
   - **Expected**: You should see the pending booking requests targeting Alice's listings (including the one Emma Watson submitted earlier).
2. Locate the booking request from Emma Watson (`2026-07-06` to `2026-07-09`) and click **Approve**.
   - **Expected**: The booking status transitions to `Approved`.
   - **Overlap Cascade**: Any pending booking request for the same listing that overlaps with Emma's approved dates is automatically changed to `Declined` by the backend.

---

## 🛡️ Walkthrough 3: Reviewer/Admin Auditing

### Goal: Verify mutation auditing logs.

#### Step 1: Inspect Audit Logs
1. In the User Role Switcher, switch to **Reviewer (Admin)**.
   - **Expected**: The interface switches to the Admin view showing the **System Mutation Audit Logs** table.
2. Verify that the table contains records with timestamps, actors, actions, and specific target descriptions for all actions performed during the walkthrough:
   - "Renter Emma Watson created booking request..."
   - "Host Alice Vance created listing..."
   - "Host Alice Vance published listing..."
   - "Host Alice Vance added availability blackout..."
   - "Host Alice Vance approved booking request..."
3. Verify that these records are sorted chronologically with the newest mutations at the top.
