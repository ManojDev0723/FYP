import React, { useState, useMemo, useEffect } from "react";
import DealCard from "../components/DealCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/food.css";

import Pagination from "../components/Pagination";

const Food = () => {
  const [foodDeals, setFoodDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-discount");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  useEffect(() => {
    const fetchFoodDeals = async () => {
      try {
        const response = await fetch("/api/deals");
        if (!response.ok) {
          throw new Error("Failed to fetch food deals");
        }
        const data = await response.json();
        const filtered = data.filter(deal => 
          deal.category_name && deal.category_name.toLowerCase().includes('food')
        );
        setFoodDeals(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching food deals:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchFoodDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    let result = [...foodDeals];

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
      if (priceFilter === "under-30") {
        result = result.filter(d => price(d) < 30);
      } else if (priceFilter === "30-60") {
        result = result.filter(d => price(d) >= 30 && price(d) <= 60);
      } else if (priceFilter === "above-60") {
        result = result.filter(d => price(d) > 60);
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
  }, [foodDeals, searchTerm, priceFilter, sortBy]);

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
    <div className="food-page" style={{ backgroundColor: '#f9f9f9' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="food-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h1>Food & Drink Deals</h1>
          <p>Savor the best flavors in town. Discover exclusive discounts on fine dining, cozy cafes, and vibrant bars.</p>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="food-filter-container">
        <div className="food-filter-group">
          <label className="food-filter-label">Search</label>
          <input 
            type="text" 
            className="food-filter-input" 
            placeholder="Restaurant, cuisine, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="food-filter-group">
          <label className="food-filter-label">Price</label>
          <select className="food-filter-input" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="all">Any Price</option>
            <option value="under-30">Under $30</option>
            <option value="30-60">$30 - $60</option>
            <option value="above-60">$60+</option>
          </select>
        </div>
        <div className="food-filter-group">
          <label className="food-filter-label">Sort By</label>
          <select className="food-filter-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="highest-discount">Highest Discount</option>
            <option value="lowest-price">Lowest Price</option>
            <option value="top-rated">Top Rated</option>
          </select>
        </div>
        
        {isFilterActive && (
          <button className="food-btn-clear-all" onClick={clearAllFilters}>Reset Filters</button>
        )}
      </div>

      {/* Food Cards Grid */}
      <div className="food-grid">
        {loading ? (
          <div className="food-loading">Yummy deals loading...</div>
        ) : error ? (
          <div className="food-error">{error}</div>
        ) : currentItems.length > 0 ? (
          currentItems.map((deal) => (
            <DealCard key={deal.dealid || deal.id} deal={deal} />
          ))
        ) : (
          <div className="food-no-results">
            <h3 style={{ marginBottom: '10px' }}>No tasty deals found</h3>
            <p>Try adjusting your filters or search terms to find what you're craving.</p>
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

export default Food;
