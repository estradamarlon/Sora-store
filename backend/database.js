const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'ecommerce.db');
let db;

async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Always start fresh for schema changes
  db = new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      image TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  seedProducts();
  seedReviews();
  saveDatabase();
  return db;
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDb() {
  return db;
}

function seedProducts() {
  const products = [
    ['Wireless Headphones', '🎧', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 'Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear sound quality with deep bass and spatial audio support.', 79.99, 'Electronics'],
    ['Running Shoes', '👟', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', 'Lightweight running shoes with advanced cushioning for maximum comfort during long runs. Breathable mesh upper.', 129.99, 'Sports'],
    ['Coffee Maker', '☕', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop', 'Programmable 12-cup coffee maker with thermal carafe. Wake up to fresh coffee every morning with precision brewing.', 49.99, 'Home'],
    ['Backpack', '🎒', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', 'Durable water-resistant backpack with laptop compartment. Perfect for work, school, or travel adventures.', 59.99, 'Accessories'],
    ['Smart Watch', '⌚', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', 'Fitness tracking smartwatch with heart rate monitor, GPS, sleep tracking, and 7-day battery life.', 199.99, 'Electronics'],
    ['Sunglasses', '🕶️', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop', 'Polarized UV400 sunglasses with lightweight titanium frame. Style meets ultimate eye protection.', 34.99, 'Accessories'],
    ['Yoga Mat', '🧘', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop', 'Extra thick non-slip yoga mat with carrying strap. Made from eco-friendly, sustainable materials.', 29.99, 'Sports'],
    ['Desk Lamp', '💡', 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop', 'LED desk lamp with adjustable brightness and color temperature. USB charging port and touch controls.', 39.99, 'Home'],
    ['Bluetooth Speaker', '🔊', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop', 'Portable waterproof Bluetooth speaker with 360-degree immersive sound and 12-hour playtime.', 44.99, 'Electronics'],
    ['Cooking Pan Set', '🍳', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop', 'Non-stick ceramic cooking pan set of 3 pieces. Oven safe up to 450F with ergonomic handles.', 89.99, 'Home'],
    ['Novel Book', '📚', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop', 'Bestselling fiction novel - an epic adventure that will keep you turning pages all night long.', 14.99, 'Books'],
    ['Plant Pot', '🪴', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop', 'Minimalist ceramic plant pot with drainage hole and bamboo saucer. Perfect for indoor plants.', 24.99, 'Home'],
    ['Gaming Mouse', '🖱️', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop', 'High-precision gaming mouse with 16000 DPI optical sensor and customizable RGB lighting effects.', 54.99, 'Electronics'],
    ['Water Bottle', '🧴', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', 'Insulated stainless steel water bottle. Keeps drinks cold 24hrs or hot 12hrs. BPA-free design.', 27.99, 'Sports'],
    ['Scented Candle', '🕯️', 'https://images.unsplash.com/photo-1602607663431-d5719c940578?w=400&h=400&fit=crop', 'Hand-poured soy wax candle with lavender essential oil blend. 60-hour clean burn time.', 19.99, 'Home'],
    ['Mechanical Keyboard', '⌨️', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400&h=400&fit=crop', 'RGB mechanical keyboard with Cherry MX switches. Full aluminum body with hot-swappable keys.', 109.99, 'Electronics'],
    ['Leather Sneakers', '👞', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', 'Classic leather sneakers with memory foam insole. Versatile minimalist style for any occasion.', 89.99, 'Fashion'],
    ['Puzzle Game', '🧩', 'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=400&h=400&fit=crop', '1000-piece jigsaw puzzle featuring a stunning landscape. Premium quality thick pieces.', 16.99, 'Toys'],
    ['Umbrella', '☂️', 'https://images.unsplash.com/photo-1534309466160-70b22cc6254d?w=400&h=400&fit=crop', 'Windproof compact travel umbrella with automatic open/close. Teflon-coated fabric.', 22.99, 'Accessories'],
    ['Art Supplies', '🎨', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop', 'Professional watercolor paint set with 24 vibrant colors, premium brushes, and mixing palette.', 34.99, 'Arts']
  ];

  const stmt = db.prepare('INSERT INTO products (name, emoji, image, description, price, category) VALUES (?, ?, ?, ?, ?, ?)');
  for (const p of products) {
    stmt.bind(p);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
}

function seedReviews() {
  const reviews = [
    [1, 'AudioFan', 5, 'Best headphones I have ever owned! The noise cancellation is incredible.'],
    [1, 'MusicLover', 4, 'Great sound quality, but a bit tight on larger heads.'],
    [1, 'DailyCommuter', 5, 'Perfect for my train commute. Blocks out everything.'],
    [2, 'RunnerJoe', 5, 'Super comfortable for my daily 10K runs. Highly recommend!'],
    [2, 'FitnessPro', 4, 'Good cushioning but runs a half size small.'],
    [3, 'CoffeeLover', 5, 'Makes perfect coffee every morning. The timer feature is a lifesaver.'],
    [3, 'MorningPerson', 4, 'Great machine, wish the carafe was slightly bigger.'],
    [4, 'Traveler', 5, 'Fits my 15-inch laptop perfectly. Very comfortable to carry all day.'],
    [5, 'TechGuru', 4, 'Great fitness tracking features. Battery life is as advertised.'],
    [5, 'HealthNut', 5, 'Love the heart rate monitor accuracy. Syncs perfectly with my phone.'],
    [6, 'StyleKing', 4, 'Look great and the polarization really helps while driving.'],
    [7, 'YogaQueen', 5, 'Perfect thickness and grip. No more slipping during hot yoga!'],
    [8, 'NightOwl', 4, 'Love the adjustable brightness. The USB port is a nice bonus.'],
    [9, 'PartyHost', 5, 'Amazing sound for its size. Took it to the beach and it survived!'],
    [10, 'HomeChef', 5, 'Nothing sticks to these pans. Easy to clean and look beautiful.'],
    [11, 'BookWorm', 4, 'Could not put it down! Finished it in two days.'],
    [12, 'PlantMom', 5, 'Beautiful minimalist design. My succulents love it.'],
    [13, 'GamerX', 5, 'Insanely precise. My aim improved significantly in FPS games.'],
    [14, 'HikerDude', 4, 'Keeps water cold all day on the trail. Durable build.'],
    [15, 'RelaxMode', 5, 'The lavender scent is so calming. Burns evenly too.'],
    [16, 'TypeFast', 5, 'The tactile feedback is perfect. Best keyboard I have used for coding.'],
    [17, 'Fashionista', 4, 'Stylish and comfortable. Go with everything in my wardrobe.'],
    [18, 'PuzzleFan', 5, 'Beautiful image and great quality pieces. Perfect weekend activity.'],
    [19, 'RainyDay', 4, 'Compact and sturdy. Survived strong winds without flipping.'],
    [20, 'ArtistSoul', 5, 'Vibrant colors and great pigmentation. Professional quality set.']
  ];

  const stmt = db.prepare('INSERT INTO reviews (product_id, username, rating, comment) VALUES (?, ?, ?, ?)');
  for (const r of reviews) {
    stmt.bind(r);
    stmt.step();
    stmt.reset();
  }
  stmt.free();
}

module.exports = { initializeDatabase, getDb, saveDatabase };
