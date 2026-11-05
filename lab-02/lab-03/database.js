
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPromise = open({
    filename: "./books.db",
    driver: sqlite3.Database
});

async function initializeDatabase() {
    const db = await dbPromise;

    // Create table if it does not exist
    await db.exec(`
        CREATE TABLE IF NOT EXISTS book (
            book_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL
        );
    `);

    // Check whether price column already exists
    const columns = await db.all("PRAGMA table_info(book)");

    const priceExists = columns.some(
        column => column.name === "price"
    );

    // Add price column without deleting existing records
    if (!priceExists) {
        await db.exec(`
            ALTER TABLE book
            ADD COLUMN price REAL NOT NULL DEFAULT 0;
        `);

        console.log("Price column added successfully!");
    }

    // Sample books with prices
    const books = [
        ["Harry Potter", "J.K. Rowling", 450],
        ["The Alchemist", "Paulo Coelho", 300],
        ["Wings of Fire", "A.P.J. Abdul Kalam", 350],
        ["Atomic Habits", "James Clear", 500],
        ["The Hobbit", "J.R.R. Tolkien", 400],
        ["Rich Dad Poor Dad", "Robert Kiyosaki", 250],
        ["The Power of Now", "Eckhart Tolle", 320],
        ["Ikigai", "Hector Garcia", 280]
    ];

    const result = await db.get(
        "SELECT COUNT(*) AS count FROM book"
    );

    if (result.count === 0) {
        for (const book of books) {
            await db.run(
                `INSERT INTO book (title, author, price)
                 VALUES (?, ?, ?)`,
                book
            );
        }

        console.log("8 books inserted successfully!");
    } else {
        // Add prices to existing books that have no price
        for (const book of books) {
            await db.run(
                `UPDATE book
                 SET price = ?
                 WHERE title = ? AND author = ?
                 AND price = 0`,
                [book[2], book[0], book[1]]
            );
        }
    }

    console.log("Database initialized successfully!");
}

module.exports = {
    dbPromise,
    initializeDatabase
};

