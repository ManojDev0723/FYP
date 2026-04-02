import React, { useState, useMemo, useEffect } from "react";
import DealCard from "../components/DealCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/adventure.css";

import Pagination from "../components/Pagination";

const Adventure = () => {
  const [adventureDeals, setAdventureDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-discount");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    const fetchAdventureDeals = async () => {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) {
          throw new Error("Failed to fetch adventure deals");
        }
        const data = await response.json();
        const filtered = data.filter(deal => 
          deal.category_name && (
            deal.category_name.toLowerCase().includes('adventure') || 
            deal.category_name.toLowerCase().includes('trek')
          )
        );
        setAdventureDeals(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching adventure deals:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAdventureDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    let result = [...adventureDeals];

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
      if (priceFilter === "under-100") {
        result = result.filter(d => price(d) < 100);
      } else if (priceFilter === "100-300") {
        result = result.filter(d => price(d) >= 100 && price(d) <= 300);
      } else if (priceFilter === "above-300") {
        result = result.filter(d => price(d) > 300);
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
  }, [adventureDeals, searchTerm, priceFilter, sortBy]);

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
    <div className="adventure-page">
      <Navbar />

      {/* Hero Section */}
      <section className="adventure-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1>Epic Adventure Deals</h1>
          <p>Unleash your wild side. Discover massive discounts on trekking, skydiving, rafting, and guided wildlife safaris.</p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="adventure-filter-container">
        <div className="adventure-filter-group">
          <label className="adventure-filter-label">Find an Adventure</label>
          <input 
            type="text" 
            className="adventure-filter-input" 
            placeholder="Trek, river, destination..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="adventure-filter-group">
          <label className="adventure-filter-label">Budget Range</label>
          <select className="adventure-filter-input" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="all">Any Price</option>
            <option value="under-100">Under $100</option>
            <option value="100-300">$100 - $300</option>
            <option value="above-300">$300+</option>
          </select>
        </div>
        <div className="adventure-filter-group">
          <label className="adventure-filter-label">Sort Experiences By</label>
          <select className="adventure-filter-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="highest-discount">Highest Discount</option>
            <option value="lowest-price">Lowest Price</option>
            <option value="top-rated">Top Rated</option>
          </select>
        </div>
        
        {isFilterActive && (
          <button className="adventure-btn-clear-all" onClick={clearAllFilters}>Clear Filters</button>
        )}
      </div>

      {/* Adventure Cards Grid */}
      <div className="adventure-grid">
        {loading ? (
          <div className="adventure-loading">Adventurers loading...</div>
        ) : error ? (
          <div className="adventure-error">{error}</div>
        ) : currentItems.length > 0 ? (
          currentItems.map((deal) => (
            <DealCard key={deal.dealid || deal.id} deal={deal} />
          ))
        ) : (
          <div className="adventure-no-results">
            <h3 style={{ marginBottom: '10px' }}>No adventures match your search.</h3>
            <p>Try clearing your filters or exploring a different category to find your next thrill.</p>
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

export default Adventure;
