import { apiClient } from './api.js';

// Global state
let activeActor = null;
let actors = [];
let savedSearches = [];
let currentListing = null;

// Map Coordinates for listings (percentage placement on mock map)
const MOCK_MAP_COORDS = {
  1: { top: '35%', left: '30%' }, // Charming Downtown Loft
  2: { top: '75%', left: '20%' }, // Cozy Beachside Bungalow
  3: { top: '25%', left: '55%' }, // Modern Studio in District 1
  4: { top: '55%', left: '70%' }, // Luxury Villa with Pool
  5: { top: '15%', left: '80%' }  // Hidden Forest Cabin
};

const IMAGES_MAP = {
  1: '/images/loft.png',
  2: '/images/bungalow.png',
  3: '/images/studio.png',
  4: '/images/villa.png'
};

// DOM elements
const el = {
  actorSelect: document.getElementById('actorSelect'),
  searchField: document.getElementById('searchField'),
  districtSelect: document.getElementById('districtSelect'),
  minPrice: document.getElementById('minPrice'),
  maxPrice: document.getElementById('maxPrice'),
  bedroomsSelect: document.getElementById('bedroomsSelect'),
  amenitiesCheckboxes: document.querySelectorAll('.checkbox-label input'),
  startDate: document.getElementById('startDate'),
  endDate: document.getElementById('endDate'),
  sortSelect: document.getElementById('sortSelect'),
  
  viewGridBtn: document.getElementById('viewGridBtn'),
  viewMapBtn: document.getElementById('viewMapBtn'),
  
  listingsCount: document.getElementById('listingsCount'),
  listingsGrid: document.getElementById('listingsGrid'),
  mapView: document.getElementById('mapView'),
  mapPins: document.getElementById('mapPins'),
  
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  pageIndicator: document.getElementById('pageIndicator'),
  
  btnSaveSearch: document.getElementById('btnSaveSearch'),
  savedSearchesList: document.getElementById('savedSearchesList'),
  savedSearchesSection: document.getElementById('savedSearchesSection'),
  
  detailModal: document.getElementById('detailModal'),
  modalClose: document.getElementById('modalClose'),
  modalHeroImg: document.getElementById('modalHeroImg'),
  modalTitle: document.getElementById('modalTitle'),
  modalHost: document.getElementById('modalHost'),
  modalDescription: document.getElementById('modalDescription'),
  modalRating: document.getElementById('modalRating'),
  modalMeta: document.getElementById('modalMeta'),
  modalAmenities: document.getElementById('modalAmenities'),
  modalBlackouts: document.getElementById('modalBlackouts'),
  
  bookingForm: document.getElementById('bookingForm'),
  bookingStartDate: document.getElementById('bookingStartDate'),
  bookingEndDate: document.getElementById('bookingEndDate'),
  bookingRenterName: document.getElementById('bookingRenterName'),
  bookingRenterEmail: document.getElementById('bookingRenterEmail'),
  
  quoteNights: document.getElementById('quoteNights'),
  quoteRate: document.getElementById('quoteRate'),
  quoteNightsTotal: document.getElementById('quoteNightsTotal'),
  quoteSubtotal: document.getElementById('quoteSubtotal'),
  quoteTotal: document.getElementById('quoteTotal'),
  quoteSection: document.getElementById('quoteSection'),
  
  bookingWarning: document.getElementById('bookingWarning'),
  btnBook: document.getElementById('btnBook'),
  toast: document.getElementById('toast')
};

// Initialize application
async function init() {
  try {
    // 1. Fetch actors
    const actorResponse = await apiClient.getActors();
    actors = actorResponse.data;
    
    // Populate actor dropdown
    el.actorSelect.innerHTML = actors.map(a => 
      `<option value="${a.id}">${a.name} (${a.role})</option>`
    ).join('');
    
    // Determine active actor
    const urlParams = new URLSearchParams(window.location.search);
    const urlActorId = urlParams.get('actor_id');
    const defaultActor = actors.find(a => a.id == urlActorId) || actors.find(a => a.role === 'renter') || actors[0];
    
    el.actorSelect.value = defaultActor.id;
    setActiveActor(defaultActor);
    
    // 2. Set up event listeners
    // Actor switch
    el.actorSelect.addEventListener('change', (e) => {
      const selected = actors.find(a => a.id == e.target.value);
      setActiveActor(selected);
      updateURLAndRender();
    });
    
    // Inputs triggering URL update
    const filterInputs = [
      el.searchField, el.districtSelect, el.minPrice, el.maxPrice, 
      el.bedroomsSelect, el.startDate, el.endDate, el.sortSelect
    ];
    
    filterInputs.forEach(input => {
      input.addEventListener('change', () => {
        // Reset page to 1 on filter change
        const state = getFormState();
        state.page = 1;
        updateURL(state);
        renderFromURL();
      });
    });
    
    // Special listener for text search keyup (debounced or just change)
    el.searchField.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const state = getFormState();
        state.page = 1;
        updateURL(state);
        renderFromURL();
      }
    });
    
    // Amenities checkboxes
    el.amenitiesCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        const state = getFormState();
        state.page = 1;
        updateURL(state);
        renderFromURL();
      });
    });
    
    // View mode buttons
    el.viewGridBtn.addEventListener('click', () => {
      const state = getFormState();
      state.view = 'grid';
      updateURL(state);
      renderFromURL();
    });
    
    el.viewMapBtn.addEventListener('click', () => {
      const state = getFormState();
      state.view = 'map';
      updateURL(state);
      renderFromURL();
    });
    
    // Pagination buttons
    el.prevPageBtn.addEventListener('click', () => {
      const state = getFormState();
      state.page = Math.max(1, (Number(state.page) || 1) - 1);
      updateURL(state);
      renderFromURL();
    });
    
    el.nextPageBtn.addEventListener('click', () => {
      const state = getFormState();
      const currentPage = Number(state.page) || 1;
      state.page = currentPage + 1;
      updateURL(state);
      renderFromURL();
    });
    
    // Saved searches
    el.btnSaveSearch.addEventListener('click', saveCurrentSearch);
    
    // Modal close
    el.modalClose.addEventListener('click', () => {
      el.detailModal.style.display = 'none';
      currentListing = null;
    });
    
    // Close modal on background click
    window.addEventListener('click', (e) => {
      if (e.target === el.detailModal) {
        el.detailModal.style.display = 'none';
        currentListing = null;
      }
    });
    
    // Booking Form date changes
    el.bookingStartDate.addEventListener('change', updatePriceQuote);
    el.bookingEndDate.addEventListener('change', updatePriceQuote);
    
    // Booking request submission
    el.bookingForm.addEventListener('submit', submitBookingRequest);

    // Host create listing button
    const btnCreateListing = document.getElementById('btnCreateListing');
    if (btnCreateListing) {
      btnCreateListing.addEventListener('click', openCreateListing);
    }

    // Host Listing Form submission
    const hostListingForm = document.getElementById('hostListingForm');
    if (hostListingForm) {
      hostListingForm.addEventListener('submit', handleListingSubmit);
    }

    // Host Listing Modal close button
    const hostListingModalClose = document.getElementById('hostListingModalClose');
    if (hostListingModalClose) {
      hostListingModalClose.addEventListener('click', () => {
        document.getElementById('hostListingModal').style.display = 'none';
      });
    }

    // Host Blackout Form submission
    const hostBlackoutForm = document.getElementById('hostBlackoutForm');
    if (hostBlackoutForm) {
      hostBlackoutForm.addEventListener('submit', handleBlackoutSubmit);
    }

    // Host Blackout Modal close button
    const hostBlackoutModalClose = document.getElementById('hostBlackoutModalClose');
    if (hostBlackoutModalClose) {
      hostBlackoutModalClose.addEventListener('click', () => {
        document.getElementById('hostBlackoutModal').style.display = 'none';
        activeListingForBlackouts = null;
      });
    }
    
    // 3. Render from current URL state
    window.onpopstate = () => renderFromURL();
    renderFromURL();
    
  } catch (err) {
    showToast('Failed to initialize application: ' + err.message, 'error');
  }
}

// Set active actor
function setActiveActor(actor) {
  activeActor = actor;
  
  // Toggle renter/host/admin views
  const renterView = document.getElementById('renterView');
  const hostView = document.getElementById('hostView');
  const adminView = document.getElementById('adminView');
  
  if (actor.role === 'host') {
    if (renterView) renterView.style.display = 'none';
    if (hostView) hostView.style.display = 'flex';
    if (adminView) adminView.style.display = 'none';
    loadHostDashboard();
  } else if (actor.role === 'reviewer') {
    if (renterView) renterView.style.display = 'none';
    if (hostView) hostView.style.display = 'none';
    if (adminView) adminView.style.display = 'flex';
    loadAdminDashboard();
  } else {
    if (renterView) renterView.style.display = 'flex';
    if (hostView) hostView.style.display = 'none';
    if (adminView) adminView.style.display = 'none';
    
    // Show/hide saved searches based on role
    if (actor.role === 'renter') {
      el.savedSearchesSection.style.display = 'block';
      loadSavedSearches();
    } else {
      el.savedSearchesSection.style.display = 'none';
    }
  }
  
  // Update prefilled name and email in modal booking form
  if (el.bookingRenterName) el.bookingRenterName.value = actor.name;
  if (el.bookingRenterEmail) el.bookingRenterEmail.value = `${actor.name.toLowerCase()}@example.com`;
}

// Gather filters from DOM inputs
function getFormState() {
  const amenities = [];
  el.amenitiesCheckboxes.forEach(cb => {
    if (cb.checked) amenities.push(cb.value);
  });
  
  const state = {
    search: el.searchField.value,
    district: el.districtSelect.value,
    min_price: el.minPrice.value,
    max_price: el.maxPrice.value,
    bedrooms: el.bedroomsSelect.value,
    amenities: amenities.join(','),
    start_date: el.startDate.value,
    end_date: el.endDate.value,
    sort: el.sortSelect.value,
    page: new URLSearchParams(window.location.search).get('page') || 1,
    view: el.viewGridBtn.classList.contains('active') ? 'grid' : 'map'
  };
  
  return state;
}

// Update URL parameters from a state object
function updateURL(state) {
  const params = new URLSearchParams();
  
  // Always preserve actor_id in URL
  if (activeActor) {
    params.set('actor_id', activeActor.id);
  }
  
  Object.entries(state).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      params.set(key, val);
    }
  });
  
  window.history.pushState(null, '', '?' + params.toString());
}

// Convenient helper to push current state & render
function updateURLAndRender() {
  const state = getFormState();
  updateURL(state);
  renderFromURL();
}

// Main rendering function: reads URL, populates forms, calls API, displays results
async function renderFromURL() {
  const params = new URLSearchParams(window.location.search);
  


  // If host or reviewer mode, do not render renter discovery
  if (activeActor && (activeActor.role === 'host' || activeActor.role === 'reviewer')) {
    return;
  }
  
  // 1. Synchronize form inputs with URL query parameters (source of truth)
  el.searchField.value = params.get('search') || '';
  el.districtSelect.value = params.get('district') || '';
  el.minPrice.value = params.get('min_price') || '';
  el.maxPrice.value = params.get('max_price') || '';
  el.bedroomsSelect.value = params.get('bedrooms') || '';
  el.startDate.value = params.get('start_date') || '';
  el.endDate.value = params.get('end_date') || '';
  el.sortSelect.value = params.get('sort') || 'rating';
  
  const amenitiesParam = params.get('amenities') || '';
  const selectedAmenities = amenitiesParam.split(',').filter(Boolean);
  el.amenitiesCheckboxes.forEach(cb => {
    cb.checked = selectedAmenities.includes(cb.value);
  });
  
  const viewParam = params.get('view') || 'grid';
  if (viewParam === 'grid') {
    el.viewGridBtn.classList.add('active');
    el.viewMapBtn.classList.remove('active');
    el.listingsGrid.style.display = 'grid';
    el.mapView.style.display = 'none';
  } else {
    el.viewGridBtn.classList.remove('active');
    el.viewMapBtn.classList.add('active');
    el.listingsGrid.style.display = 'none';
    el.mapView.style.display = 'flex';
  }
  
  const pageParam = Number(params.get('page')) || 1;
  
  // Ensure active actor matches URL actor_id if changed
  const actorIdParam = params.get('actor_id');
  if (actorIdParam && (!activeActor || activeActor.id != actorIdParam)) {
    const matched = actors.find(a => a.id == actorIdParam);
    if (matched) setActiveActor(matched);
  }
  
  // 2. Load listings from backend API
  try {
    const apiParams = {
      search: params.get('search'),
      district: params.get('district'),
      min_price: params.get('min_price'),
      max_price: params.get('max_price'),
      bedrooms: params.get('bedrooms'),
      amenities: params.get('amenities'),
      start_date: params.get('start_date'),
      end_date: params.get('end_date'),
      sort: params.get('sort'),
      page: pageParam,
      limit: 6
    };
    
    const response = await apiClient.getListings(apiParams);
    const listings = response.data;
    const pagination = response.pagination;
    
    // 3. Render Listing Cards (Grid)
    renderListingCards(listings, params.get('start_date') && params.get('end_date'));
    
    // 4. Render Map markers
    renderMapMarkers(listings);
    
    // 5. Update pagination controls
    el.listingsCount.innerHTML = `Showing <span>${listings.length}</span> of <span>${pagination.total}</span> rentals`;
    el.pageIndicator.innerHTML = `Page <span>${pagination.page}</span> of <span>${pagination.pages || 1}</span>`;
    el.prevPageBtn.disabled = pagination.page <= 1;
    el.nextPageBtn.disabled = pagination.page >= pagination.pages;
    
  } catch (err) {
    showToast('Failed to load listings: ' + err.message, 'error');
  }
}

// Render grid cards
function renderListingCards(listings, hasDateFilter) {
  if (listings.length === 0) {
    el.listingsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <h3>No rentals found matching your filters.</h3>
        <p style="margin-top: 8px;">Try broadening your search criteria.</p>
      </div>
    `;
    return;
  }
  
  el.listingsGrid.innerHTML = listings.map(l => {
    const imgPath = IMAGES_MAP[l.id] || '/images/loft.png';
    const availabilityBadge = hasDateFilter 
      ? `<span class="availability-pill available"><span style="color:var(--success)">●</span> Available</span>`
      : `<span class="availability-pill check">Enter dates to check</span>`;
      
    const amenitiesTags = l.amenities.map(a => `<span class="tag">${a}</span>`).slice(0, 3).join('');
    
    return `
      <div class="listing-card" id="listing-card-${l.id}">
        <div class="card-image-wrapper">
          <img src="${imgPath}" class="card-image" alt="${l.title}">
          <div class="rating-badge">★ ${l.rating.toFixed(1)}</div>
        </div>
        <div class="card-info">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="card-meta">${l.district} • ${l.bedrooms} Br</span>
            ${availabilityBadge}
          </div>
          <h3 class="card-title">${l.title}</h3>
          <p class="card-description">${l.short_description}</p>
          <div class="card-tags">
            ${amenitiesTags}
            ${l.amenities.length > 3 ? `<span class="tag">+${l.amenities.length - 3} more</span>` : ''}
          </div>
        </div>
        <div class="card-footer">
          <div class="card-price">$${l.nightly_price} <span>/ night</span></div>
          <button class="btn-card" onclick="openListingDetail(${l.id})">Details</button>
        </div>
      </div>
    `;
  }).join('');
}

// Make openListingDetail globally available
window.openListingDetail = openListingDetail;

// Render pins on mock map
function renderMapMarkers(listings) {
  el.mapPins.innerHTML = '';
  
  listings.forEach(l => {
    const coords = MOCK_MAP_COORDS[l.id] || { top: '50%', left: '50%' };
    
    const pin = document.createElement('div');
    pin.className = 'map-pin';
    pin.style.top = coords.top;
    pin.style.left = coords.left;
    
    pin.innerHTML = `
      <div class="pin-bubble">$${l.nightly_price}</div>
      <div class="pin-arrow"></div>
      <div class="pin-tooltip">
        <div class="tooltip-title">${l.title}</div>
        <div class="tooltip-price">$${l.nightly_price}/night • ${l.rating} ★</div>
      </div>
    `;
    
    pin.addEventListener('click', () => {
      // Highlight selection and open details
      document.querySelectorAll('.pin-bubble').forEach(b => b.classList.remove('selected'));
      pin.querySelector('.pin-bubble').classList.add('selected');
      openListingDetail(l.id);
    });
    
    el.mapPins.appendChild(pin);
  });
}

// Open details modal
async function openListingDetail(id) {
  try {
    const response = await apiClient.getListingDetail(id);
    const listing = response.data;
    currentListing = listing;
    
    // Prefill modal details
    el.modalHeroImg.src = IMAGES_MAP[listing.id] || '/images/loft.png';
    el.modalTitle.textContent = listing.title;
    el.modalHost.innerHTML = `Hosted by <span>${listing.host_name}</span>`;
    el.modalDescription.textContent = listing.description;
    el.modalRating.textContent = `★ ${listing.rating.toFixed(1)}`;
    el.modalMeta.textContent = `${listing.district} • ${listing.bedrooms} Bedrooms • $${listing.nightly_price}/night`;
    
    // Amenities
    el.modalAmenities.innerHTML = listing.amenities.map(a => 
      `<div class="amenities-list-item">${a}</div>`
    ).join('');
    
    // Blackouts
    if (listing.blackouts && listing.blackouts.length > 0) {
      el.modalBlackouts.innerHTML = listing.blackouts.map(b => 
        `<div class="blackout-item">Unavailable: ${b.start_date} to ${b.end_date}</div>`
      ).join('');
    } else {
      el.modalBlackouts.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted)">No blackout dates configured.</div>`;
    }
    
    // Populate form dates from search state
    const params = new URLSearchParams(window.location.search);
    el.bookingStartDate.value = params.get('start_date') || '';
    el.bookingEndDate.value = params.get('end_date') || '';
    
    // Actor details
    if (activeActor) {
      el.bookingRenterName.value = activeActor.name;
      el.bookingRenterEmail.value = `${activeActor.name.toLowerCase()}@example.com`;
    }
    
    updatePriceQuote();
    
    // Open modal
    el.detailModal.style.display = 'flex';
  } catch (err) {
    showToast('Failed to open listing detail: ' + err.message, 'error');
  }
}

// Calculate price quote & validate availability in details view
function updatePriceQuote() {
  const startStr = el.bookingStartDate.value;
  const endStr = el.bookingEndDate.value;
  
  if (!startStr || !endStr) {
    el.quoteSection.style.display = 'none';
    el.bookingWarning.style.display = 'none';
    el.btnBook.disabled = true;
    el.btnBook.textContent = 'Enter dates to book';
    return;
  }
  
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    el.quoteSection.style.display = 'none';
    el.bookingWarning.style.display = 'block';
    el.bookingWarning.textContent = '⚠️ Invalid date range selection.';
    el.btnBook.disabled = true;
    el.btnBook.textContent = 'Invalid dates';
    return;
  }
  
  const diffTime = end.getTime() - start.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (nights <= 0) {
    el.quoteSection.style.display = 'none';
    el.bookingWarning.style.display = 'block';
    el.bookingWarning.textContent = '⚠️ Booking must be at least 1 night.';
    el.btnBook.disabled = true;
    el.btnBook.textContent = 'Invalid dates';
    return;
  }
  
  // Show quote
  el.quoteSection.style.display = 'block';
  el.quoteRate.textContent = `$${currentListing.nightly_price}`;
  el.quoteNights.textContent = nights;
  el.quoteNightsTotal.textContent = `$${currentListing.nightly_price} × ${nights} nights`;
  
  const subtotal = currentListing.nightly_price * nights;
  el.quoteSubtotal.textContent = `$${subtotal.toLocaleString()}`;
  el.quoteTotal.textContent = `$${subtotal.toLocaleString()}`;
  
  // Verify overlap with blackouts
  let hasOverlap = false;
  
  if (currentListing.blackouts) {
    for (const b of currentListing.blackouts) {
      // Overlap condition: start_date <= b.end_date AND end_date >= b.start_date
      if (startStr <= b.end_date && endStr >= b.start_date) {
        hasOverlap = true;
        break;
      }
    }
  }
  
  if (hasOverlap) {
    el.bookingWarning.style.display = 'block';
    el.bookingWarning.textContent = '⚠️ Selected dates overlap with unavailable/blackout dates.';
    el.btnBook.disabled = true;
    el.btnBook.textContent = 'Dates unavailable';
  } else {
    el.bookingWarning.style.display = 'none';
    el.btnBook.disabled = false;
    el.btnBook.textContent = 'Submit Booking Request';
  }
}

// Submit Booking Request
async function submitBookingRequest(e) {
  e.preventDefault();
  
  if (!currentListing || !activeActor) return;
  
  const bookingData = {
    listing_id: currentListing.id,
    renter_id: activeActor.id,
    start_date: el.bookingStartDate.value,
    end_date: el.bookingEndDate.value,
    renter_name: el.bookingRenterName.value,
    renter_email: el.bookingRenterEmail.value
  };
  
  if (!bookingData.renter_name.trim() || !bookingData.renter_email.trim()) {
    showToast('Name and email are required.', 'error');
    return;
  }
  
  try {
    el.btnBook.disabled = true;
    el.btnBook.textContent = 'Submitting...';
    
    await apiClient.createBookingRequest(bookingData);
    
    showToast('Booking request submitted successfully!', 'success');
    el.detailModal.style.display = 'none';
    currentListing = null;
    
    // Refresh search results in case listing is now blocked
    renderFromURL();
  } catch (err) {
    showToast(err.message, 'error');
    el.btnBook.disabled = false;
    el.btnBook.textContent = 'Submit Booking Request';
  }
}

// Load saved searches
async function loadSavedSearches() {
  if (!activeActor || activeActor.role !== 'renter') return;
  
  try {
    const response = await apiClient.getSavedSearches(activeActor.id);
    savedSearches = response.data;
    
    if (savedSearches.length === 0) {
      el.savedSearchesList.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:10px;">No saved searches.</div>`;
      return;
    }
    
    el.savedSearchesList.innerHTML = savedSearches.map(s => {
      const filterSummary = Object.entries(s.filters)
        .filter(([_, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => `${k.replace('_',' ')}: ${v}`)
        .join(', ');
        
      return `
        <div class="saved-search-item" onclick="restoreSavedSearch(${s.id})">
          <div class="saved-search-info">
            <div class="saved-search-name">${s.name}</div>
            <div class="saved-search-details">${filterSummary || 'All rentals'}</div>
          </div>
          <span style="color:var(--accent); font-size:0.9rem;">→</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    showToast('Failed to load saved searches: ' + err.message, 'error');
  }
}

// Restore saved search to URL
function restoreSavedSearch(id) {
  const match = savedSearches.find(s => s.id === id);
  if (!match) return;
  
  // Set filters in URL and trigger rendering
  updateURL(match.filters);
  renderFromURL();
  showToast(`Restored search: "${match.name}"`, 'success');
}

// Make restoreSavedSearch globally available
window.restoreSavedSearch = restoreSavedSearch;

// Save current search configuration
async function saveCurrentSearch() {
  if (!activeActor || activeActor.role !== 'renter') {
    showToast('You must be logged in as a renter to save searches.', 'error');
    return;
  }
  
  const formState = getFormState();
  // Strip out view/page from saved query if desired
  delete formState.page;
  delete formState.view;
  
  // Prompt user for a search name
  const defaultName = `Search: ${formState.district || 'All districts'}${formState.min_price ? ' $' + formState.min_price + '+' : ''}`;
  const name = prompt('Enter a name for this saved search:', defaultName);
  
  if (!name || !name.trim()) return;
  
  try {
    await apiClient.saveSearch(activeActor.id, name.trim(), formState);
    showToast('Search saved successfully!', 'success');
    loadSavedSearches();
  } catch (err) {
    showToast('Failed to save search: ' + err.message, 'error');
  }
}

// Toast notification helper
function showToast(message, type = 'success') {
  el.toast.textContent = message;
  el.toast.className = `toast ${type}`;
  el.toast.style.display = 'flex';
  
  setTimeout(() => {
    el.toast.style.display = 'none';
  }, 4000);
}

// Start application
document.addEventListener('DOMContentLoaded', init);

// =========================================================================
// Host Dashboard & Operations Flow
// =========================================================================

let activeListingForBlackouts = null;

async function loadHostDashboard() {
  if (!activeActor || activeActor.role !== 'host') return;
  try {
    const listingsRes = await apiClient.getHostListings(activeActor.id);
    renderHostListings(listingsRes.data);

    const bookingsRes = await apiClient.getHostBookings(activeActor.id);
    renderHostBookings(bookingsRes.data);
  } catch (err) {
    showToast('Failed to load host dashboard: ' + err.message, 'error');
  }
}

function renderHostListings(listings) {
  const grid = document.getElementById('hostListingsGrid');
  if (!grid) return;

  if (listings.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <h3>You don't have any listings yet.</h3>
        <p style="margin-top: 8px;">Click "+ Create Listing" to list your property.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = listings.map(l => {
    const imgPath = IMAGES_MAP[l.id] || '/images/loft.png';
    const statusClass = l.is_published ? 'published' : 'draft';
    const statusText = l.is_published ? 'Published' : 'Draft';
    const statusBg = l.is_published ? 'var(--success)' : 'var(--text-muted)';
    
    return `
      <div class="listing-card" id="host-listing-card-${l.id}">
        <div class="card-image-wrapper">
          <img src="${imgPath}" class="card-image" alt="${l.title}">
          <div class="rating-badge">★ ${l.rating.toFixed(1)}</div>
          <div class="status-badge ${statusClass}" style="position: absolute; top: 12px; left: 12px; padding: 4px 8px; border-radius: var(--border-radius-sm); font-size: 0.75rem; font-weight: 600; background: ${statusBg}; color: white; border: 1px solid rgba(255,255,255,0.1);">
            ${statusText}
          </div>
        </div>
        <div class="card-info">
          <span class="card-meta">${l.district} • ${l.bedrooms} Br • $${l.nightly_price}/night</span>
          <h3 class="card-title">${l.title}</h3>
          <p class="card-description">${l.short_description}</p>
        </div>
        <div class="card-footer" style="flex-direction: column; gap: 8px; align-items: stretch; border-top: 1px solid var(--panel-border); padding-top: 12px;">
          <div style="display: flex; gap: 8px; width: 100%;">
            <button class="btn-card" style="flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--panel-border); cursor: pointer;" onclick="openEditListing(${l.id})">Edit</button>
            <button class="btn-card" style="flex: 1; background: ${l.is_published ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; border: 1px solid ${l.is_published ? 'var(--danger)' : 'var(--success)'}; color: ${l.is_published ? 'var(--danger)' : 'var(--success)'}; cursor: pointer;" onclick="togglePublishListing(${l.id})">
              ${l.is_published ? 'Unpublish' : 'Publish'}
            </button>
          </div>
          <button class="btn-card" style="width: 100%; cursor: pointer;" onclick="openManageBlackouts(${l.id})">Manage Blackouts</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderHostBookings(bookings) {
  const container = document.getElementById('hostBookingsList');
  if (!container) return;

  if (bookings.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.95rem;">
        No booking requests received yet.
      </div>
    `;
    return;
  }

  container.innerHTML = bookings.map(b => {
    const statusBg = b.status === 'pending' ? 'rgba(234, 179, 8, 0.2)' : b.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
    const statusColor = b.status === 'pending' ? '#eab308' : b.status === 'approved' ? 'var(--success)' : 'var(--danger)';
    
    return `
      <div class="booking-card" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--panel-border); border-radius: var(--border-radius-md); padding: 16px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">${b.listing_title}</h4>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">Guest: ${b.renter_name} (${b.renter_email})</div>
          </div>
          <span class="status-pill status-${b.status}" style="font-size: 0.75rem; font-weight: 600; padding: 4px 8px; border-radius: var(--border-radius-sm); background: ${statusBg}; color: ${statusColor}; text-transform: capitalize;">
            ${b.status}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
          <span style="color: var(--text-secondary);">${b.start_date} to ${b.end_date}</span>
          <span style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">$${b.total_price}</span>
        </div>
        ${b.status === 'pending' ? `
        <div style="display: flex; gap: 8px; margin-top: 4px;">
          <button class="btn-card" style="flex: 1; font-size: 0.8rem; padding: 8px 12px; background: var(--success); color: white; border: none; cursor: pointer;" onclick="approveBooking(${b.id})">Approve</button>
          <button class="btn-card" style="flex: 1; font-size: 0.8rem; padding: 8px 12px; background: var(--danger); color: white; border: none; cursor: pointer;" onclick="declineBooking(${b.id})">Decline</button>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

async function openEditListing(id) {
  try {
    const response = await apiClient.getListingDetail(id);
    const listing = response.data;
    
    document.getElementById('hostListingId').value = listing.id;
    document.getElementById('hostListingTitleInput').value = listing.title;
    document.getElementById('hostListingDistrictInput').value = listing.district;
    document.getElementById('hostListingPriceInput').value = listing.nightly_price;
    document.getElementById('hostListingBedroomsInput').value = listing.bedrooms;
    document.getElementById('hostListingShortDescInput').value = listing.short_description;
    document.getElementById('hostListingDescInput').value = listing.description;

    const container = document.getElementById('hostListingAmenitiesContainer');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = listing.amenities.includes(cb.value);
    });

    document.getElementById('hostListingModalTitle').textContent = 'Edit Listing';
    document.getElementById('hostListingModal').style.display = 'flex';
  } catch (err) {
    showToast('Failed to load listing details: ' + err.message, 'error');
  }
}

function openCreateListing() {
  document.getElementById('hostListingId').value = '';
  document.getElementById('hostListingTitleInput').value = '';
  document.getElementById('hostListingDistrictInput').value = 'Downtown';
  document.getElementById('hostListingPriceInput').value = '';
  document.getElementById('hostListingBedroomsInput').value = '';
  document.getElementById('hostListingShortDescInput').value = '';
  document.getElementById('hostListingDescInput').value = '';

  const container = document.getElementById('hostListingAmenitiesContainer');
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);

  document.getElementById('hostListingModalTitle').textContent = 'Create New Listing';
  document.getElementById('hostListingModal').style.display = 'flex';
}

async function handleListingSubmit(e) {
  e.preventDefault();
  if (!activeActor || activeActor.role !== 'host') return;

  const listingId = document.getElementById('hostListingId').value;
  const title = document.getElementById('hostListingTitleInput').value.trim();
  const district = document.getElementById('hostListingDistrictInput').value;
  const nightly_price = Number(document.getElementById('hostListingPriceInput').value);
  const bedrooms = Number(document.getElementById('hostListingBedroomsInput').value);
  const short_description = document.getElementById('hostListingShortDescInput').value.trim();
  const description = document.getElementById('hostListingDescInput').value.trim();

  const amenities = [];
  const container = document.getElementById('hostListingAmenitiesContainer');
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (cb.checked) amenities.push(cb.value);
  });

  const listingData = {
    title,
    district,
    nightly_price,
    bedrooms,
    short_description,
    description,
    amenities
  };

  try {
    if (listingId) {
      await apiClient.updateListing(activeActor.id, listingId, listingData);
      showToast('Listing updated successfully!', 'success');
    } else {
      await apiClient.createListing(activeActor.id, listingData);
      showToast('Listing created successfully!', 'success');
    }
    document.getElementById('hostListingModal').style.display = 'none';
    loadHostDashboard();
  } catch (err) {
    showToast('Failed to save listing: ' + err.message, 'error');
  }
}

async function togglePublishListing(id) {
  if (!activeActor) return;
  try {
    const response = await apiClient.togglePublishListing(activeActor.id, id);
    showToast(`Listing ${response.data.is_published ? 'published' : 'unpublished'} successfully!`, 'success');
    loadHostDashboard();
  } catch (err) {
    showToast('Failed to update publication status: ' + err.message, 'error');
  }
}

async function openManageBlackouts(id) {
  if (!activeActor) return;
  activeListingForBlackouts = id;
  try {
    const detailRes = await apiClient.getListingDetail(id);
    document.getElementById('hostBlackoutModalListingTitle').textContent = detailRes.data.title;
    
    await loadBlackoutsList(id);
    
    document.getElementById('hostBlackoutModal').style.display = 'flex';
  } catch (err) {
    showToast('Failed to load blackouts: ' + err.message, 'error');
  }
}

async function loadBlackoutsList(listingId) {
  const listContainer = document.getElementById('hostBlackoutsList');
  if (!listContainer) return;

  try {
    const blackoutsRes = await apiClient.getListingBlackouts(activeActor.id, listingId);
    const blackouts = blackoutsRes.data;

    if (blackouts.length === 0) {
      listContainer.innerHTML = `<div style="font-size:0.85rem; color:var(--text-muted); padding:10px;">No blackout dates set.</div>`;
      return;
    }

    listContainer.innerHTML = blackouts.map(b => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid var(--panel-border); border-radius:var(--border-radius-sm); padding:8px 12px; font-size:0.85rem;">
        <span>${b.start_date} to ${b.end_date}</span>
        <button style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-weight:600; padding:2px 6px;" onclick="deleteBlackout(${listingId}, ${b.id})">Remove</button>
      </div>
    `).join('');
  } catch (err) {
    listContainer.innerHTML = `<div style="font-size:0.85rem; color:var(--danger); padding:10px;">Failed to load blackouts.</div>`;
  }
}

async function handleBlackoutSubmit(e) {
  e.preventDefault();
  if (!activeActor || !activeListingForBlackouts) return;

  const start_date = document.getElementById('hostBlackoutStartInput').value;
  const end_date = document.getElementById('hostBlackoutEndInput').value;

  if (!start_date || !end_date) {
    showToast('Start and end dates are required.', 'error');
    return;
  }

  try {
    await apiClient.createBlackout(activeActor.id, activeListingForBlackouts, { start_date, end_date });
    showToast('Blackout added successfully!', 'success');
    document.getElementById('hostBlackoutStartInput').value = '';
    document.getElementById('hostBlackoutEndInput').value = '';
    await loadBlackoutsList(activeListingForBlackouts);
  } catch (err) {
    showToast('Failed to add blackout: ' + err.message, 'error');
  }
}

async function deleteBlackout(listingId, blackoutId) {
  if (!activeActor) return;
  if (!confirm('Are you sure you want to remove this blackout range?')) return;
  try {
    await apiClient.deleteBlackout(activeActor.id, listingId, blackoutId);
    showToast('Blackout removed successfully!', 'success');
    await loadBlackoutsList(listingId);
  } catch (err) {
    showToast('Failed to remove blackout: ' + err.message, 'error');
  }
}

async function approveBooking(id) {
  if (!activeActor) return;
  try {
    await apiClient.updateBookingStatus(activeActor.id, id, 'approved');
    showToast('Booking approved successfully!', 'success');
    loadHostDashboard();
  } catch (err) {
    showToast('Failed to approve booking: ' + err.message, 'error');
  }
}

async function declineBooking(id) {
  if (!activeActor) return;
  try {
    await apiClient.updateBookingStatus(activeActor.id, id, 'declined');
    showToast('Booking declined successfully!', 'success');
    loadHostDashboard();
  } catch (err) {
    showToast('Failed to decline booking: ' + err.message, 'error');
  }
}

// Expose Host functions to window for onclick handlers
window.openEditListing = openEditListing;
window.togglePublishListing = togglePublishListing;
window.openManageBlackouts = openManageBlackouts;
window.deleteBlackout = deleteBlackout;
window.approveBooking = approveBooking;
window.declineBooking = declineBooking;
window.loadHostDashboard = loadHostDashboard;

async function loadAdminDashboard() {
  if (!activeActor || activeActor.role !== 'reviewer') return;
  const listContainer = document.getElementById('auditLogsList');
  if (!listContainer) return;
  
  try {
    const response = await apiClient.getAuditLogs(activeActor.id);
    const logs = response.data;
    
    if (logs.length === 0) {
      listContainer.innerHTML = `
        <tr>
          <td colspan="7" style="padding: 20px; text-align: center; color: var(--text-muted);">
            No audit logs recorded yet.
          </td>
        </tr>
      `;
      return;
    }
    
    listContainer.innerHTML = logs.map(log => {
      const date = new Date(log.timestamp).toLocaleString();
      return `
        <tr style="border-bottom: 1px solid var(--panel-border); color: var(--text-primary);">
          <td style="padding: 12px; white-space: nowrap; color: var(--text-secondary);">${date}</td>
          <td style="padding: 12px;">${log.actor_id}</td>
          <td style="padding: 12px; font-weight: 500;">${log.actor_name}</td>
          <td style="padding: 12px;"><span class="tag" style="background: rgba(99,102,241,0.15); color: #818cf8; font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; display: inline-block;">${log.action_type}</span></td>
          <td style="padding: 12px; color: var(--text-secondary);">${log.entity_type}</td>
          <td style="padding: 12px;">${log.entity_id || '-'}</td>
          <td style="padding: 12px; color: var(--text-secondary); max-width: 300px; word-wrap: break-word;">${log.summary}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    listContainer.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 20px; text-align: center; color: var(--danger);">
          Failed to load audit logs: ${err.message}
        </td>
      </tr>
    `;
  }
}

window.loadAdminDashboard = loadAdminDashboard;
