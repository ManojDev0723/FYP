import React, { useState, useMemo } from "react";
import DealCard from "../components/DealCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/spa.css";

const spaData = [
  {
    id: 201,
    name: "90-Min Swedish Massage with Aroma",
    location: "Zen Wellness Center",
    rating: 4.9,
    originalPrice: 110,
    discountPrice: 65,
    category: "Massage",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 202,
    name: "Full Body Ayurvedic Detox",
    location: "Lotus Spa Retreat",
    rating: 4.7,
    originalPrice: 150,
    discountPrice: 85,
    category: "Ayurveda",
    image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 203,
    name: "Couples Infrared Sauna Session",
    location: "Urban Sweat Studio",
    rating: 4.8,
    originalPrice: 75,
    discountPrice: 45,
    category: "Sauna",
    image: "https://images.unsplash.com/photo-1596178056346-63eef12a03d1?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 204,
    name: "Premium Gel Manicure & Pedicure",
    location: "Glow Beauty Bar",
    rating: 4.6,
    originalPrice: 60,
    discountPrice: 35,
    category: "Beauty & Salon",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 205,
    name: "Deep Tissue Muscle Therapy (60-Min)",
    location: "Healing Hands",
    rating: 4.9,
    originalPrice: 95,
    discountPrice: 55,
    category: "Massage",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 206,
    name: "Rejuvenating Facial Treatment",
    location: "Derma Care Clinic",
    rating: 4.8,
    originalPrice: 130,
    discountPrice: 70,
    category: "Beauty & Salon",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop",
  }
];

const categories = ["All", "Massage", "Ayurveda", "Sauna", "Beauty & Salon"];

const Spa = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest-discount");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredDeals = useMemo(() => {
    let result = [...spaData];

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
      if (priceFilter === "under-50") {
        result = result.filter(d => d.discountPrice < 50);
      } else if (priceFilter === "50-100") {
        result = result.filter(d => d.discountPrice >= 50 && d.discountPrice <= 100);
      } else if (priceFilter === "above-100") {
        result = result.filter(d => d.discountPrice > 100);
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

      {/* Category Pills */}
      <div className="spa-category-pills">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`spa-category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Spa Cards Grid */}
      <div className="spa-grid">
        {filteredDeals.length > 0 ? (
          filteredDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))
        ) : (
          <div className="spa-no-results">
            <h3 style={{ marginBottom: '10px', color: '#34495e' }}>No tranquil deals found</h3>
            <p>We couldn't find any treatments matching your current filters. Try relaxing your search criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Spa;
