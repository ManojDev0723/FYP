import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Hook to check authentication status
  const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const role = localStorage.getItem('role');
      
      if (token) {
        setIsLoggedIn(true);
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser({
              name: parsedUser.name || parsedUser.fullname || parsedUser.username || "User",
              avatarUrl: parsedUser.avatar_url || parsedUser.avatarUrl || "https://ui-avatars.com/api/?name=" + (parsedUser.name || parsedUser.fullname || "U")
            });
          } catch (e) {
            setUser({ name: "User", avatarUrl: "https://ui-avatars.com/api/?name=U" });
          }
        } else {
          // If token exists but user data is missing, still show as logged in
          setUser({ name: "User", avatarUrl: "https://ui-avatars.com/api/?name=U" });
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    }, []);

    return { isLoggedIn, user };
  };

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const uniqueItems = cart.length;
      setCartCount(uniqueItems);
    };

    updateCartCount();
    window.addEventListener("cartUpdate", updateCartCount);
    return () => window.removeEventListener("cartUpdate", updateCartCount);
  }, []);
  
  const colors = {
    primary: '#1a6b3c',
    primaryDark: '#145630',
    darkText: '#1C1C1C',
    muted: '#5A5A5A',
    border: '#E4E4DF',
    white: '#FFFFFF',
    bg: 'rgba(255, 255, 255, 0.95)'
  };

  const styles = {
    nav: {
      height: '70px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: colors.bg,
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 24px',
      fontFamily: "'DM Sans', sans-serif",
    },
    container: {
      width: '100%',
      maxWidth: '1200px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
    },
    logoIcon: {
      width: '36px',
      height: '36px',
      backgroundColor: colors.primary,
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.white,
    },
    logoText: {
      fontFamily: "'Playfair Display', serif",
      fontSize: '22px',
      fontWeight: '700',
      color: colors.darkText,
      margin: 0,
    },
    logoHub: {
      color: colors.primary,
    },
    centerNav: {
      display: 'flex',
      gap: '32px',
      alignItems: 'center',
    },
    navLink: {
      fontSize: '14px',
      fontWeight: '500',
      color: colors.muted,
      textDecoration: 'none',
      transition: 'color 0.2s ease',
    },
    navAction: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    iconButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: colors.darkText,
      padding: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s',
      position: 'relative'
    },
    badge: {
      position: 'absolute',
      top: '0',
      right: '0',
      backgroundColor: '#e74c3c',
      color: colors.white,
      fontSize: '10px',
      fontWeight: 'bold',
      padding: '2px 5px',
      borderRadius: '10px',
      transform: 'translate(20%, -20%)'
    },
    ctaButton: {
      backgroundColor: colors.primary,
      color: colors.white,
      padding: '10px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'background-color 0.2s ease',
      border: 'none',
      cursor: 'pointer',
    },
    hamburger: {
      display: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      color: colors.darkText,
    },
    mobileMenu: {
      display: isOpen ? 'flex' : 'none',
      position: 'absolute',
      top: '70px',
      left: 0,
      right: 0,
      backgroundColor: colors.white,
      borderBottom: `1px solid ${colors.border}`,
      flexDirection: 'column',
      padding: '24px',
      gap: '20px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textDecoration: 'none',
      color: colors.darkText,
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid ${colors.white}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      <style dangerouslySetInnerHTML={{ __html: `
        .dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown-content {
          display: none;
          position: absolute;
          background-color: ${colors.white};
          min-width: 180px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
          z-index: 101;
          border-radius: 8px;
          border: 1px solid ${colors.border};
          top: 100%;
          right: 0;
          padding: 8px 0;
        }
        .dropdown:hover .dropdown-content {
          display: block;
        }
        .dropdown-item {
          color: ${colors.darkText};
          padding: 10px 16px;
          text-decoration: none;
          display: block;
          font-size: 14px;
          transition: background-color 0.2s;
          cursor: pointer;
        }
        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: ${colors.primary};
        }
        .mobile-dropdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-left: 20px;
          margin-top: 8px;
          border-left: 2px solid ${colors.border};
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
          .mobile-menu { display: ${isOpen ? 'flex' : 'none'} !important; }
          .get-started-btn { display: none !important; }
          .user-desktop { display: none !important; }
        }
        
        .nav-link:hover { color: ${colors.primary} !important; }
        .nav-icon-btn:hover { color: ${colors.primary} !important; }
        .cta-btn:hover { background-color: ${colors.primaryDark} !important; }
      `}} />

      <nav style={styles.nav}>
        <div style={styles.container}>
          {/* Left: Logo */}
          <Link to="/" style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <h1 style={styles.logoText}>Deal<span style={styles.logoHub}>Hub</span></h1>
          </Link>

          {/* Center: Desktop Nav */}
          <div className="desktop-nav" style={styles.centerNav}>
            <Link to="/home" className="nav-link" style={styles.navLink}>Home</Link>
            <Link to="/" className="nav-link" style={styles.navLink}>Explore</Link>
            <div className="dropdown">
              <span className="nav-link" style={{...styles.navLink, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'}}>
                Categories
              </span>
              <div className="dropdown-content" style={{left: 0}}>
                <Link to="/hotels" className="dropdown-item">Hotel</Link>
                <Link to="/spa" className="dropdown-item">Spa & Wellness</Link>
                <Link to="/food" className="dropdown-item">Food & Drinks</Link>
                <Link to="/adventure" className="dropdown-item">Adventures</Link>
              </div>
            </div>
            <a href="/#features" className="nav-link" style={styles.navLink}>Features</a>
            <a href="/#faq" className="nav-link" style={styles.navLink}>FAQ</a>
          </div>

          {/* Right: Action */}
          <div style={styles.navAction}>
            <div className="nav-icons" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div 
                onClick={() => { window.location.href = isLoggedIn ? "/dashboard" : "/login" }} 
                aria-label="Wishlist" 
                style={{...styles.iconButton, cursor: 'pointer', zIndex: 102}} 
                className="nav-icon-btn"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <div 
                onClick={() => { navigate("/cart") }} 
                aria-label="Shopping Cart" 
                style={{...styles.iconButton, cursor: 'pointer', zIndex: 102}} 
                className="nav-icon-btn"
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
                </div>
              </div>
              <div 
                onClick={() => { window.location.href = isLoggedIn ? "/dashboard" : "/login" }} 
                aria-label="Notifications" 
                style={{...styles.iconButton, cursor: 'pointer', zIndex: 102}} 
                className="nav-icon-btn"
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  <span style={{...styles.badge, backgroundColor: colors.primary}}>1</span>
                </div>
              </div>
            </div>

            {isLoggedIn ? (
              <div 
                onClick={() => { window.location.href = "/dashboard" }}
                style={{...styles.userProfile, cursor: 'pointer', zIndex: 102}} 
                className="nav-link"
              >
                <img src={user.avatarUrl} alt={user.name} style={styles.avatar} />
                <span>{user.name}</span>
              </div>
            ) : (
              <Link to="/login" className="cta-btn get-started-btn" style={styles.ctaButton}>Get Started</Link>
            )}
            
            <button 
              className="hamburger-btn" 
              style={styles.hamburger}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <div className="mobile-menu" style={styles.mobileMenu}>
          {isLoggedIn && (
            <div style={{...styles.userProfile, marginBottom: '10px'}}>
              <Link to="/dashboard" style={{display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit'}}>
                <img src={user.avatarUrl} alt={user.name} style={styles.avatar} />
                <div style={{display: 'flex', flexDirection: 'column'}}>
                  <span>{user.name}</span>
                  <span style={{fontSize: '12px', color: colors.muted, fontWeight: 'normal'}}>Dashboard</span>
                </div>
              </Link>
            </div>
          )}
          <Link to="/home" className="nav-link" style={{...styles.navLink, fontSize: '16px'}} onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/" className="nav-link" style={{...styles.navLink, fontSize: '16px'}} onClick={() => setIsOpen(false)}>Explore</Link>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="nav-link" style={{...styles.navLink, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px'}}>
              Categories
            </span>
            <div className="mobile-dropdown">
              <Link to="/hotels" className="nav-link" style={{...styles.navLink, fontSize: '15px'}} onClick={() => setIsOpen(false)}>Hotel</Link>
              <Link to="/spa" className="nav-link" style={{...styles.navLink, fontSize: '15px'}} onClick={() => setIsOpen(false)}>Spa & Wellness</Link>
              <Link to="/food" className="nav-link" style={{...styles.navLink, fontSize: '15px'}} onClick={() => setIsOpen(false)}>Food & Drinks</Link>
              <Link to="/adventure" className="nav-link" style={{...styles.navLink, fontSize: '15px'}} onClick={() => setIsOpen(false)}>Adventures</Link>
            </div>
          </div>
          <Link to="/dashboard" className="nav-link" style={{...styles.navLink, fontSize: '16px'}} onClick={() => setIsOpen(false)}>Wishlist</Link>
          <Link to="/cart" className="nav-link" style={{...styles.navLink, fontSize: '16px'}} onClick={() => setIsOpen(false)}>Shopping Cart {cartCount > 0 && `(${cartCount})`}</Link>
          <Link to="/dashboard" className="nav-link" style={{...styles.navLink, fontSize: '16px'}} onClick={() => setIsOpen(false)}>Settings</Link>
          <hr style={{width: '100%', border: 0, borderTop: `1px solid ${colors.border}`, margin: '8px 0'}} />
          {!isLoggedIn && (
            <Link to="/login" className="cta-btn" style={{...styles.ctaButton, textAlign: 'center'}} onClick={() => setIsOpen(false)}>Get Started</Link>
          )}
        </div>
      </nav>
    </>
  );
}
