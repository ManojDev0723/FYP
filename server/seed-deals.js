require("dotenv").config();
const db = require("./config/db");

const seedDeals = async () => {
  try {
    // 1. Ensure categories exist
    const [existingCats] = await db.query("SELECT * FROM categories");
    if (existingCats.length === 0) {
      console.log("Seeding categories...");
      await db.query("INSERT INTO categories (name) VALUES ('Hotels'), ('Spas'), ('Food'), ('Adventures'), ('Tours')");
    }
    const [cats] = await db.query("SELECT * FROM categories");
    const catMap = {};
    cats.forEach(c => { catMap[c.name.toLowerCase()] = c.categoryid; });

    // 2. Ensure at least one verified active business exists
    const [exBiz] = await db.query("SELECT * FROM business WHERE verified = 1 AND status = 'active'");
    let businessid;
    if (exBiz.length === 0) {
      console.log("No active verified business found. Creating one...");
      // Check for a user first
      const [users] = await db.query("SELECT id FROM users LIMIT 1");
      if (users.length === 0) {
        console.log("No users found. Please create a user first.");
        process.exit(1);
      }
      const [res] = await db.query(
        "INSERT INTO business (ownerid, name, description, verified, status) VALUES (?, 'Lakeside Bliss Resort', 'Premium lakeside luxury', 1, 'active')",
        [users[0].id]
      );
      businessid = res.insertId;
    } else {
      businessid = exBiz[0].businessid;
    }

    // 3. Clear and seed deals for a fresh look (Optional, I'll just add if < 3)
    const [deals] = await db.query("SELECT * FROM deals WHERE status = 'active'");
    if (deals.length < 6) {
      console.log("Adding sample deals...");
      const sampleDeals = [
        { title: 'Luxurious Deluxe Room with Lakeside View', op: 5000, dp: 2500, cat: catMap['hotels'] || cats[0].categoryid, img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800' },
        { title: 'Premium Full Body Massage & Spa Wellness', op: 3000, dp: 1650, cat: catMap['spas'] || cats[1].categoryid, img: 'https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=800' },
        { title: 'Romantic Lakeside Candlelight Dinner', op: 2500, dp: 1625, cat: catMap['food'] || cats[2].categoryid, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800' },
        { title: 'Paragliding Adventure Tour - Feel the Freedom', op: 4000, dp: 2400, cat: catMap['adventures'] || cats[3].categoryid, img: 'https://images.unsplash.com/photo-1533551270381-06758682855f?auto=format&fit=crop&q=80&w=800' },
        { title: 'Guided Heritage Walk through Ancient Kathmandu', op: 1500, dp: 1050, cat: catMap['tours'] || cats[4].categoryid, img: 'https://images.unsplash.com/photo-1544735038-319361773d1c?auto=format&fit=crop&q=80&w=800' },
        { title: 'Boutique Hotel Weekend Getaway Package', op: 6000, dp: 2700, cat: catMap['hotels'] || cats[0].categoryid, img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800' }
      ];

      for (const d of sampleDeals) {
        await db.query(
          "INSERT INTO deals (businessid, categoryid, title, description, originalprice, discountprice, status, startdate, enddate, quantityavailable, imageurl) VALUES (?, ?, ?, 'Premium experience', ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, ?)",
          [businessid, d.cat, d.title, d.op, d.dp, d.img]
        );
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDeals();
