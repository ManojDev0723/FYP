import React, { useState, useMemo, useEffect } from "react";
import DealCard from "../components/DealCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/spa.css";

import Pagination from "../components/Pagination";

const Spa = () => {
  const [spaDeals, setSpaDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-discount");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    const fetchSpaDeals = async () => {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) {
          throw new Error("Failed to fetch spa deals");
        }
        const data = await response.json();
        // Matching 'spa' or 'wellness'
        const filtered = data.filter(deal => 
          deal.category_name && (
            deal.category_name.toLowerCase().includes('spa') || 
            deal.category_name.toLowerCase().includes('wellness')
          )
        );
        setSpaDeals(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching spa deals:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchSpaDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    let result = [...spaDeals];

    // Search filter
    if (searchTerm) {
      result = result.filter(d => 
        (d.title || d.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (d.business_name || d.location || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      const price = (d) => Number(d.discountprice || d.discountPrice || 0);
      if (priceFilter === "under-50") {
        result = result.filter(d => price(d) < 50);
      } else if (priceFilter === "50-100") {
        result = result.filter(d => price(d) >= 50 && price(d) <= 100);
      } else if (priceFilter === "above-100") {
        result = result.filter(d => price(d) > 100);
      }
    }

    // Sorting logic
    if (sortBy === "highest-discount") {
      result.sort((a, b) => {
        const opA = Number(a.originalprice || a.originalPrice || 1);
        const dpA = Number(a.discountprice || a.discountPrice || 0);
        const opB = Number(b.originalprice || b.originalPrice || 1);
        const dpB = Number(b.discountprice || b.discountPrice || 0);
        const discA = (opA - dpA) / opA;
        const discB = (opB - dpB) / opB;
        return discB - discA;
      });
    } else if (sortBy === "lowest-price") {
      result.sort((a, b) => {
        const dpA = Number(a.discountprice || a.discountPrice || 0);
        const dpB = Number(b.discountprice || b.discountPrice || 0);
        return dpA - dpB;
      });
    } else if (sortBy === "top-rated") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [spaDeals, searchTerm, priceFilter, sortBy]);

  // Reset to first page when filtering or sorting
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priceFilter, sortBy]);

  // Paginated data logic
  const totalItems = filteredDeals.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentItems = filteredDeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceFilter("all");
    setSortBy("highest-discount");
    setActiveCategory("All");
  };

  const isFilterActive = searchTerm !== "" || priceFilter !== "all" || sortBy !== "highest-discount" || activeCategory !== "All";

  return (
    <div className="spa-page">
      <Navbar />

      {/* Hero Section */}
      <section className="spa-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1>Spa & Wellness Offers</h1>
          <p>Treat yourself to ultimate relaxation. Unwind with premium massages, rejuvenating facials, and luxury salon services at unbeatable prices.</p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="spa-filter-container">
        <div className="spa-filter-group">
          <label className="spa-filter-label">Search Treatments</label>
          <input 
            type="text" 
            className="spa-filter-input" 
            placeholder="Massage, facial, or salon..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="spa-filter-group">
          <label className="spa-filter-label">Price Range</label>
          <select className="spa-filter-input" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="all">Any Price</option>
            <option value="under-50">Under $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="above-100">$100+</option>
          </select>
        </div>
        <div className="spa-filter-group">
          <label className="spa-filter-label">Sort By</label>
          <select className="spa-filter-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="highest-discount">Highest Discount</option>
            <option value="lowest-price">Lowest Price</option>
            <option value="top-rated">Top Rated</option>
          </select>
        </div>
        
        {isFilterActive && (
          <button className="spa-btn-clear-all" onClick={clearAllFilters}>Reset Filters</button>
        )}
      </div>

      {/* Spa Cards Grid */}
      <div className="spa-grid">
        {loading ? (
          <div className="spa-loading">Finding tranquility...</div>
        ) : error ? (
          <div className="spa-error">{error}</div>
        ) : currentItems.length > 0 ? (
          currentItems.map((deal) => (
            <DealCard key={deal.dealid || deal.id} deal={deal} />
          ))
        ) : (
          <div className="spa-no-results">
            <h3 style={{ marginBottom: '10px', color: '#34495e' }}>No tranquil deals found</h3>
            <p>We couldn't find any treatments matching your current filters. Try relaxing your search criteria.</p>
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

export default Spa;
