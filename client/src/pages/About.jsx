import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/About.css';

const About = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const milestones = [
    { value: '500K+', label: 'Happy Customers' },
    { value: '8,000+', label: 'Verified Merchants' },
    { value: '50+', label: 'Cities Covered' }
  ];

  const values = [
    {
      title: 'Real Value Always',
      description: 'We ensure every deal on DealHub provides genuine savings and a quality experience for our users.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z"></path>
          <path d="M11 3L8 9l3 12 3-12-3-6z"></path>
          <path d="M2 9h20"></path>
        </svg>
      )
    },
    {
      title: 'Merchant Success',
      description: 'We partner with local businesses to help them grow, reach new audiences, and thrive in the digital economy.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      )
    },
    {
      title: 'Trust & Transparency',
      description: 'No hidden fees. No fine print traps. We build trust through clear communication and honest deals.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      title: 'Community First',
      description: 'We believe in the power of local. By connecting neighbors with local gems, we strengthen communities.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ];

  const team = [
    { name: 'Alex Rivera', title: 'Founder & CEO', initials: 'AR' },
    { name: 'Suman Thapa', title: 'Chief Technology Officer', initials: 'ST' },
    { name: 'Elena Chen', title: 'Head of Partnerships', initials: 'EC' }
  ];

  return (
    <div className="about-page">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Great deals, every single day</h1>
          <p> DealHub is your ultimate gateway to premium experiences. We bridge the gap between savvy shoppers and the best local services, hotels, and adventures.</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>
                Founded in 2024, DealHub began with a simple observation: there were thousands of amazing local businesses in Nepal that people simply didn't know about. We wanted to create a platform that not only offered great value to consumers but also served as a powerful growth engine for local merchants.
              </p>
              <p>
                Today, DealHub is the leading deal-discovery platform, connecting millions of users with handpicked experiences in hospitality, dining, wellness, and adventure. Our mission remains the same: to make luxury and high-quality experiences accessible to everyone, every single day.
              </p>
            </div>
            <div className="story-stats">
              <div className="stats-container">
                {milestones.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="section-padding values-section">
        <div className="container">
          <div className="section-title">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do at DealHub</p>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon" style={{ color: 'var(--primary-green)' }}>{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-title">
            <h2>Meet the Visionaries</h2>
            <p>The passionate team behind the DealHub experience</p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="avatar-initials">{member.initials}</div>
                <h3>{member.name}</h3>
                <p>{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to discover something new?</h2>
            <p>Join thousands of explorers discovering the best of their city every day. Whether you're looking for a getaway or looking to grow your business, DealHub is for you.</p>
            <div className="cta-btns">
              <Link to="/" className="btn-primary-red">Explore Deals</Link>
              <Link to="/merchant-register" className="btn-outline-red">List Your Business</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
