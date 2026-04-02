import React, { useState, useMemo, useEffect } from "react";
import HotelCard from "../components/HotelCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/hotel.css";

import Pagination from "../components/Pagination";

const Hotel = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-discount");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) {
          throw new Error("Failed to fetch hotel deals");
        }
        const data = await response.json();

        const hotelDeals = data
          .filter(deal => deal.category_name && deal.category_name.toLowerCase().includes('hotel'))
          .map(deal => ({
            id: deal.dealid,
            name: deal.title,
            location: deal.business_name || "Unknown Location",
            rating: 4.5,
            originalPrice: Number(deal.originalprice) || 0,
            discountPrice: Number(deal.discountprice) || 0,
            image: deal.imageurl && deal.imageurl.startsWith('http')
              ? deal.imageurl
              : deal.imageurl ? `/uploads${deal.imageurl}` : "https://images.unsplash.com/photo-1566073771259-6a8506099945"
          }));

        setHotels(hotelDeals);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hotels:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    let result = [...hotels];

    // Search filter
    if (searchTerm) {
      result = result.filter(h =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (ratingFilter !== "all") {
      result = result.filter(h => h.rating >= parseFloat(ratingFilter));
    }

    // Price filter
    if (priceFilter !== "all") {
      if (priceFilter === "under-150") {
        result = result.filter(h => h.discountPrice < 150);
      } else if (priceFilter === "150-250") {
        result = result.filter(h => h.discountPrice >= 150 && h.discountPrice <= 250);
      } else if (priceFilter === "above-250") {
        result = result.filter(h => h.discountPrice > 250);
      }
    }

    // Sorting logic
    if (sortBy === "highest-discount") {
      result.sort((a, b) => {
        const discA = (a.originalPrice - a.discountPrice) / a.originalPrice;
        const discB = (b.originalPrice - b.discountPrice) / b.originalPrice;
        return discB - discA;
      });
    } else if (sortBy === "lowest-price") {
      result.sort((a, b) => a.discountPrice - b.discountPrice);
    } else if (sortBy === "top-rated") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [hotels, searchTerm, priceFilter, ratingFilter, sortBy]);

  // Reset to first page when filtering or sorting
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceFilter, ratingFilter, sortBy]);

  // Paginated data logic
  const totalItems = filteredHotels.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredHotels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceFilter("all");
    setRatingFilter("all");
    setSortBy("highest-discount");
  };

  const isFilterActive = searchTerm !== "" || priceFilter !== "all" || ratingFilter !== "all" || sortBy !== "highest-discount";

  return (
    <div className="hotel-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hotel-hero">
        <div className="container">
          <h1>Hotels & Stays</h1>
          <p>Discover premium luxury and cozy escapes with exclusive discounts of up to 60%.</p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="filter-container">
        <div className="filter-group">
          <label className="filter-label">Destination</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search Kathmandu, Pokhara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Price Range</label>
          <select className="filter-input" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="all">Any Price</option>
            <option value="under-150">Under $150</option>
            <option value="150-250">$150 - $250</option>
            <option value="above-250">$250+</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Rating</label>
          <select className="filter-input" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
            <option value="all">Any Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>
        <div className="filter-group">
          <label className="filter-label">Sort By</label>
          <select className="filter-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="highest-discount">Highest Discount</option>
            <option value="lowest-price">Lowest Price</option>
            <option value="top-rated">Top Rated</option>
          </select>
        </div>
        {isFilterActive && (
          <button className="btn-clear-all" onClick={clearAllFilters}>Clear all</button>
        )}
      </div>

      {/* Hotel Cards Grid */}
      <div className="hotel-grid">
        {loading ? (
          <div className="loading-message">Loading hotels...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : currentItems.length > 0 ? (
          currentItems.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))
        ) : (
          <div className="no-results-message">
            No hotels found matching your search criteria.
          </div>
        )}
      </div>

      {/* Pagination Component */}
      {!loading && !error && currentItems.length > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      <Footer />
    </div>
  );
};

export default Hotel;