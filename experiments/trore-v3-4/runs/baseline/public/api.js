const API_BASE = '/api';

export const apiClient = {
  headers() {
    return {
      'Content-Type': 'application/json',
      'X-Trore-Auth': 'v3-4-case-study'
    };
  },

  async request(url, options = {}) {
    options.headers = {
      ...this.headers(),
      ...options.headers
    };
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  },

  getActors() {
    return this.request(`${API_BASE}/actors`);
  },

  getListings(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return this.request(`${API_BASE}/listings?${query.toString()}`);
  },

  getListingDetail(id) {
    return this.request(`${API_BASE}/listings/${id}`);
  },

  getSavedSearches(actorId) {
    return this.request(`${API_BASE}/saved-searches?actor_id=${actorId}`);
  },

  saveSearch(actorId, name, filters) {
    return this.request(`${API_BASE}/saved-searches`, {
      method: 'POST',
      body: JSON.stringify({ actor_id: actorId, name, filters })
    });
  },

  createBookingRequest(bookingData) {
    return this.request(`${API_BASE}/booking-requests`, {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  getHostListings(actorId) {
    return this.request(`${API_BASE}/host/listings?actor_id=${actorId}`);
  },

  createListing(actorId, listingData) {
    return this.request(`${API_BASE}/host/listings`, {
      method: 'POST',
      body: JSON.stringify({ actor_id: actorId, ...listingData })
    });
  },

  updateListing(actorId, listingId, listingData) {
    return this.request(`${API_BASE}/host/listings/${listingId}`, {
      method: 'PUT',
      body: JSON.stringify({ actor_id: actorId, ...listingData })
    });
  },

  togglePublishListing(actorId, listingId) {
    return this.request(`${API_BASE}/host/listings/${listingId}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ actor_id: actorId })
    });
  },

  getListingBlackouts(actorId, listingId) {
    return this.request(`${API_BASE}/host/listings/${listingId}/blackouts?actor_id=${actorId}`);
  },

  createBlackout(actorId, listingId, blackoutData) {
    return this.request(`${API_BASE}/host/listings/${listingId}/blackouts`, {
      method: 'POST',
      body: JSON.stringify({ actor_id: actorId, ...blackoutData })
    });
  },

  deleteBlackout(actorId, listingId, blackoutId) {
    return this.request(`${API_BASE}/host/listings/${listingId}/blackouts/${blackoutId}?actor_id=${actorId}`, {
      method: 'DELETE'
    });
  },

  getHostBookings(actorId) {
    return this.request(`${API_BASE}/host/bookings?actor_id=${actorId}`);
  },

  updateBookingStatus(actorId, bookingId, status) {
    return this.request(`${API_BASE}/host/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ actor_id: actorId, status })
    });
  },

  getAuditLogs(actorId) {
    return this.request(`${API_BASE}/admin/audit-logs?actor_id=${actorId}`);
  }
};
