import React, { useState, useMemo } from "react";
import DealCard from "../components/DealCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/food.css";

const foodData = [
  {
    id: 101,
    name: "Gourmet Dinner Array",
    location: "Downtown",
    rating: 4.8,
    originalPrice: 120,
    discountPrice: 85,
    category: "Fine Dining",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 102,
    name: "Sunday Brunch Buffet",
    location: "City Center",
    rating: 4.5,
    originalPrice: 65,
    discountPrice: 40,
    category: "Buffet",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 103,
    name: "Artisan Coffee & Pastries",
    location: "Westside",
    rating: 4.9,
    originalPrice: 25,
    discountPrice: 15,
    category: "Cafe",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop",
  },
  {
    id: 104,
    name: "Authentic Sushi Experience",
    location: "East Village",
    rating: 4.7,
    originalPrice: 90,
    discountPrice: 65,
    category: "Asian",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 105,
    name: "Gourmet Burger Combo",
    location: "Downtown",
    rating: 4.6,
    originalPrice: 35,
    discountPrice: 22,
    category: "Casual",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop",
  },
  {
    id: 106,
    name: "Rooftop Cocktails for Two",
    location: "Uptown",
    rating: 4.8,
    originalPrice: 80,
    discountPrice: 50,
    category: "Bars",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop",
  }
];

const categories = ["All", "Fine Dining", "Buffet", "Cafe", "Asian", "Casual", "Bars"];

const Food = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-discount");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredDeals = useMemo(() => {
    let result = [...foodData];

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter(d => d.category === activeCategory);
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      if (priceFilter === "under-30") {
        result = result.filter(d => d.discountPrice < 30);
      } else if (priceFilter === "30-60") {
        result = result.filter(d => d.discountPrice >= 30 && d.discountPrice <= 60);
      } else if (priceFilter === "above-60") {
        result = result.filter(d => d.discountPrice > 60);
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
  }, [searchTerm, priceFilter, sortBy, activeCategory]);

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

      {/* Category Pills */}
      <div className="food-category-pills">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`food-category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Cards Grid */}
      <div className="food-grid">
        {filteredDeals.length > 0 ? (
          filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))
        ) : (
          <div className="food-no-results">
            <h3 style={{ marginBottom: '10px' }}>No tasty deals found</h3>
            <p>Try adjusting your filters or search terms to find what you're craving.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Food;
