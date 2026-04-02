import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DealCard from "../components/DealCard";
import "../styles/home.css";

// Mock Data Sets
const latestDeals = [
  {
    id: 101,
    name: "Luxury 5-Star Resort Stay",
    location: "Maldives",
    rating: 4.9,
    originalPrice: 1200,
    discountPrice: 850,
    category: "Resort",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 201,
    name: "Gourmet Dinner for Two",
    location: "Downtown Steakhouse",
    rating: 4.8,
    originalPrice: 150,
    discountPrice: 89,
    category: "Fine Dining",
    image: "https://images.unsplash.com/photo-1544025162-8315ea07b469?q=80&w=2069&auto=format&fit=crop",
  },
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
    id: 401,
    name: "Couples Aromatherapy Massage",
    location: "Zen Wellness Center",
    rating: 4.8,
    originalPrice: 180,
    discountPrice: 95,
    category: "Massage",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop",
  }
];

const expiringDeals = [
  {
    id: 202,
    name: "All-You-Can-Eat Sushi Buffet",
    location: "Ginza Sushi House",
    rating: 4.6,
    originalPrice: 65,
    discountPrice: 40,
    category: "Buffet",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 402,
    name: "Traditional Ayurvedic Therapy",
    location: "Veda Healing Spa",
    rating: 4.7,
    originalPrice: 120,
    discountPrice: 70,
    category: "Ayurveda",
    image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 102,
    name: "Weekend Wilderness Cabin",
    location: "Rocky Mountains",
    rating: 4.8,
    originalPrice: 350,
    discountPrice: 200,
    category: "Cabin",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1974&auto=format&fit=crop",
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
  }
];

const topDiscounts = [
  {
    id: 403,
    name: "Full Body Detox & Sauna",
    location: "Urban Oasis",
    rating: 4.9,
    originalPrice: 200,
    discountPrice: 80,
    category: "Sauna",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 203,
    name: "Artisan Coffee Tasting Experience",
    location: "The Roast Room",
    rating: 4.9,
    originalPrice: 40,
    discountPrice: 15,
    category: "Cafe",
    image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: 305,
    name: "Bungee Jumping Weekend Pass",
    location: "Bhote Koshi",
    rating: 4.6,
    originalPrice: 90,
    discountPrice: 35,
    category: "Extreme",
    image: "https://images.unsplash.com/photo-1571216503943-30588147d2f9?q=80&w=2071&auto=format&fit=crop",
  },
  {
    id: 104,
    name: "Historic Hotel Weekend",
    location: "Rome, Italy",
    rating: 4.7,
    originalPrice: 450,
    discountPrice: 210,
    category: "Hotel",
    image: "https://images.unsplash.com/photo-1551882547-ff40c0d5b5df?q=80&w=2074&auto=format&fit=crop",
  }
];

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />

      {/* Header Section */}
      <section className="home-header">
        <h1>Welcome Back</h1>
        <p>Discover personalized offers tailored just for you. Explore our newest additions or grab deals before they're gone!</p>
      </section>

      {/* Main Content Area */}
      <div className="home-content">

        {/* Latest Deals Section */}
        <section className="home-section">
          <div className="home-section-header">
            <h2>
              <span className="section-icon">✨</span> Latest Deals
            </h2>
            <Link to="/#categories" className="home-section-action">View All categories &rarr;</Link>
          </div>
          <div className="home-carousel-container">
            {latestDeals.map(deal => (
              <div key={deal.id} className="home-carousel-item">
                <DealCard deal={deal} />
              </div>
            ))}
          </div>
        </section>

        {/* Expiring Soon Section */}
        <section className="home-section">
          <div className="home-section-header">
            <h2>
              <span className="section-icon">⏰</span> Expiring Soon
            </h2>
          </div>
          <div className="home-carousel-container">
            {expiringDeals.map(deal => (
              <div key={deal.id} className="home-carousel-item">
                <DealCard deal={deal} />
              </div>
            ))}
          </div>
        </section>

        {/* Top Discounts Section */}
        <section className="home-section">
          <div className="home-section-header">
            <h2>
              <span className="section-icon">🔥</span> Top Discounts
            </h2>
          </div>
          <div className="home-carousel-container">
            {topDiscounts.map(deal => (
              <div key={deal.id} className="home-carousel-item">
                <DealCard deal={deal} />
              </div>
            ))}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default Home;
