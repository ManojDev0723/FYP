
import { useNavigate } from "react-router-dom";

// const defaultCategories = [
//   {
//     id: "all",
//     name: "All Deals",
//     icon: "🎯",
//     path: "/"
//   },
//   {
//     id: "hotels",
//     name: "Hotels & Stays",
//     icon: "🏨",
//     path: "/hotels"
//   },
//   {
//     id: "food",
//     name: "Food & Drinks",
//     icon: "🍽️",
//     path: "/food"
//   },
//   {
//     id: "adventures",
//     name: "Adventures",
//     icon: "🎈",
//     path: "/adventures"
//   },
//   {
//     id: "spa",
//     name: "Spa & Wellness",
//     icon: "🏆",
//     path: "/spa"
//   },
//   {
//     id: "tours",
//     name: "Tours & Guides",
//     icon: "🗺️",
//     path: "/tours"
//   }
// ];

function CategoryNav({ categories = defaultCategories, selectedCategory, onSelectCategory }) {
  const navigate = useNavigate();
 

  const handleClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category.id);
    }
    navigate(category.path);
  };
  return (
<nav className="nav-categories">
  <div className="container">
    <ul className="category-nav">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`nav-category-btn ${selectedCategory === category.id ? "active" : ""}`}
          onClick={() => handleClick(category)}
        >
          <span className="category-icon">{category.icon}</span>
          <span className="category-name">{category.name}</span>
        </button>
      ))}
    </ul>
  </div>
</nav>);
}

export default CategoryNav;