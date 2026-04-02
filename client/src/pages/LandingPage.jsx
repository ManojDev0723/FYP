import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import CategoryNav from "../components/CategoryNav";
import DealCard from "../components/DealCard";

function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/deals");
        setDeals(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching deals:", error);
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const Categories = [
    { id: "all", name: "All Deals", icon: "🎯", path: "/" },
    { id: "hotels", name: "Hotels & Stays", icon: "🏨", path: "/hotels" },
    { id: "food", name: "Food & Drinks", icon: "🍽️", path: "/food" },
    { id: "adventure", name: "Adventures", icon: "🎈", path: "/adventures" },
    { id: "spa", name: "Spa & Wellness", icon: "🏆", path: "/spa" },
    { id: "tours", name: "Tours & Guides", icon: "🗺️", path: "/tours" }
  ];

  // Filter deals based on category and search
  const filteredDeals = deals.filter((deal) => {
    const matchesCategory =
      selectedCategory === "all" ||
      deal.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.business_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="home-page">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-container">
            {/* Left Column: Text & Stats */}
            <div className="hero-text" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <h2>Discover Premium Experiences for Less</h2>
              <p>The ultimate platform for luxury hotels, zen spas, and thrilling adventures at unbeatable prices. Join over 1 million happy explorers today.</p>
              
              <div className="hero-btns" style={{ justifyContent: 'center' }}>
                <Link to="/deals" className="btn-search" style={{ height: 'auto', display: 'flex', alignItems: 'center' }}>Browse Deals</Link>
                <Link to="#how-it-works" className="btn-hero-outline">How it Works</Link>
              </div>

              <div className="hero-stats" style={{ justifyContent: 'center' }}>
                <div className="stat-item">
                  <span className="stat-num">2.4k+</span>
                  <span className="stat-label">Active Deals</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">1.2M+</span>
                  <span className="stat-label">Customers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-num">$15M+</span>
                  <span className="stat-label">Total Savings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section id="categories" className="categories-section">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="category-card-grid">
            <Link to="/hotels" className="category-card hotels">
              <div className="card-icon">🏨</div>
              <h3>Hotels</h3>
              <p>Luxury Stays</p>
            </Link>
            <Link to="/spa" className="category-card spas">
              <div className="card-icon">💆</div>
              <h3>Spas</h3>
              <p>Wellness & Zen</p>
            </Link>
            <Link to="/food" className="category-card food">
              <div className="card-icon">🍽️</div>
              <h3>Food</h3>
              <p>Fine Dining</p>
            </Link>
            <Link to="/adventure" className="category-card adventures">
              <div className="card-icon">🪂</div>
              <h3>Adventures</h3>
              <p>Thrill & Joy</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <h2>Why Choose DealHub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h4>Verified Quality</h4>
              <p>Every partner is hand-checked for the highest service standards.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h4>Flash Deals</h4>
              <p>Exclusive limited-time offers with up to 60% savings every day.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Secure Booking</h4>
              <p>100% encrypted transactions and instant digital voucher delivery.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h4>Hyper-Local</h4>
              <p>Discover the best experiences right in your neighborhood.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h4>Real Reviews</h4>
              <p>Verified feedback from actual customers who booked the deal.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h4>Easy Gifting</h4>
              <p>Personalize and send deal vouchers to friends and family instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-section">
        <div className="container">
          <h2>How It Works</h2>
          <div className="how-grid">
            <div className="process-line"></div>
            <div className="how-step">
              <div className="step-number">1</div>
              <h4>Find Your Deal</h4>
              <p>Browse our handpicked premium deals in hotels, spas, restaurants, and more.</p>
            </div>
            <div className="how-step">
              <div className="step-number">2</div>
              <h4>Book Instantly</h4>
              <p>Purchase securely and receive your digital deal voucher delivered instantly.</p>
            </div>
            <div className="how-step">
              <div className="step-number">3</div>
              <h4>Enjoy Premium</h4>
              <p>Redeem your voucher at the partner venue and experience the luxury.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="deals-section">
        <div className="container">
          <h2>
            {selectedCategory === "all"
              ? "Discover Latest Deals"
              : `${Categories.find((c) => c.id === selectedCategory)?.name}`}
          </h2>
          
          <div className="deals-grid">
            {loading ? (
              <div className="loading-state">Discovering best deals for you...</div>
            ) : filteredDeals.length > 0 ? (
              filteredDeals.slice(0, 6).map((deal) => (
                <DealCard key={deal.dealid} deal={deal} />
              ))
            ) : (
              <div className="no-deals">No deals found matching your criteria.</div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2>Loved by Customers & Businesses</h2>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar-initials">SP</div>
                <div className="user-info">
                  <h4>Suman P.</h4>
                  <div className="user-stars">★★★★★</div>
                </div>
              </div>
              <p className="quote">"I found an incredible deal on a Lakeside resort in Pokhara. The booking was seamless and the savings were real!"</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar-initials">AK</div>
                <div className="user-info">
                  <h4>Aarav K.</h4>
                  <div className="user-stars">★★★★★</div>
                </div>
              </div>
              <p className="quote">"The spa deals are unmatched. I saved over 50% on a premium massage and the service was absolutely top-notch."</p>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar-initials">RJ</div>
                <div className="user-info">
                  <h4>Rojina J.</h4>
                  <div className="user-stars">★★★★★</div>
                </div>
              </div>
              <p className="quote">"Perfect for family weekend getaways. We've booked three adventures so far and every experience was handpicked and high quality."</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-accordion">
            {[
              {
                q: "How do I book a deal on DealHub?",
                a: "Simply browse our categories, select a deal you love, and click 'Explore Deal'. You can purchase securely using any major payment method. Your digital voucher will be delivered instantly to your dashboard and email."
              },
              {
                q: "How long is my voucher valid for?",
                a: "Voucher validity varies by deal, but most are valid for 3 to 6 months. You can check the specific expiration date on the deal page before purchasing and on your digital voucher after booking."
              },
              {
                q: "Can I cancel my booking and get a refund?",
                a: "Most vouchers are refundable within 7 days of purchase, provided they haven't been redeemed. Some flash sales may be non-refundable; please check the 'Fine Print' section on the deal card."
              },
              {
                q: "I'm a business owner. How can I list my deals?",
                a: "We would love to partner with you! Click the 'Merchant Login' link in the footer to create a business account. Once verified, you can start listing your premium experiences in minutes."
              }
            ].map((faq, index) => (
              <div key={index} className={`faq-item ${activeFaq === index ? 'active' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(index)}>
                  {faq.q}
                  <span className="faq-toggle">{activeFaq === index ? "−" : "+"}</span>
                </button>
                <div className="faq-answer">
                  <div className="faq-answer-inner">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default LandingPage;
