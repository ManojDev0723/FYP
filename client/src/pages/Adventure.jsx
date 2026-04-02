import React, { useState, useMemo } from "react";
import DealCard from "../components/DealCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/adventure.css";

const adventureData = [
  {
    id: 301,
    name: "Everest Base Camp Helicopter Tour",
    location: "Kathmandu Valley",
    rating: 4.9,
    originalPrice: 1200,
    discountPrice: 850,
    category: "Air",
    image: "https://images.unsplash.com/photo-1544971587-b842c27f8e14?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 302,
    name: "Trishuli River White Water Rafting",
    location: "Trishuli River",
    rating: 4.7,
    originalPrice: 60,
    discountPrice: 35,
    category: "Water Sports",
    image: "https://images.unsplash.com/photo-1533503254580-5a3d4f40d7c7?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: 303,
    name: "Tandem Skydiving Thrill",
    location: "Pokhara",
    rating: 4.9,
    originalPrice: 300,
    discountPrice: 220,
    category: "Air",
    image: "https://images.unsplash.com/photo-1520697967919-614532a2f8b5?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 304,
    name: "3-Day Annapurna Base Camp Trek setup",
    location: "Annapurna Region",
    rating: 4.8,
    originalPrice: 250,
    discountPrice: 160,
    category: "Trekking",
    image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=2076&auto=format&fit=crop",
  },
  {
    id: 305,
    name: "Bungee Jumping Weekend Pass",
    location: "Bhote Koshi",
    rating: 4.6,
    originalPrice: 90,
    discountPrice: 65,
    category: "Extreme",
    image: "https://images.unsplash.com/photo-1571216503943-30588147d2f9?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: 306,
    name: "Guided Jungle Safari",
    location: "Chitwan National Park",
    rating: 4.7,
    originalPrice: 150,
    discountPrice: 95,
    category: "Nature Safari",
    image: "https://images.unsplash.com/photo-1552554625-7ec5fb58d207?q=80&w=2071&auto=format&fit=crop",
  }
];

const categories = ["All", "Trekking", "Water Sports", "Air", "Extreme", "Nature Safari"];

const Adventure = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-discount");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredDeals = useMemo(() => {
    let result = [...adventureData];

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
      if (priceFilter === "under-100") {
        result = result.filter(d => d.discountPrice < 100);
      } else if (priceFilter === "100-300") {
        result = result.filter(d => d.discountPrice >= 100 && d.discountPrice <= 300);
      } else if (priceFilter === "above-300") {
        result = result.filter(d => d.discountPrice > 300);
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

      {/* Category Pills */}
      <div className="adventure-category-pills">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`adventure-category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Adventure Cards Grid */}
      <div className="adventure-grid">
        {filteredDeals.length > 0 ? (
          filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))
        ) : (
          <div className="adventure-no-results">
            <h3 style={{ marginBottom: '10px' }}>No adventures match your search.</h3>
            <p>Try clearing your filters or exploring a different category to find your next thrill.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Adventure;
