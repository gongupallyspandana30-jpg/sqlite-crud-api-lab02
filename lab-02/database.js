const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const dbPromise = open({
    filename: "./books.db",
    driver: sqlite3.Database
});

async function initializeDatabase() {
    const db = await dbPromise;

    await db.exec(`
        CREATE TABLE IF NOT EXISTS book (
            book_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL
        );
    `);

    console.log("Book table created successfully!");
    
    const books = [
        ["Harry Potter", "J.K. Rowling"],
        ["The Alchemist", "Paulo Coelho"],
        ["Wings of Fire", "A.P.J. Abdul Kalam"],
        ["Atomic Habits", "James Clear"],
        ["The Hobbit", "J.R.R. Tolkien"],
        ["Rich Dad Poor Dad", "Robert Kiyosaki"],
        ["The Power of Now", "Eckhart Tolle"],
        ["Ikigai", "Hector Garcia"]
    ];

    const result = await db.get(
        "SELECT COUNT(*) AS count FROM book"
    );

    if (result.count === 0) {
        for (const book of books) {
            await db.run(
                "INSERT INTO book (title, author) VALUES (?, ?)",
                book
            );
        }

        console.log("8 books inserted successfully!");
    }

}

module.exports = {
    dbPromise,
    initializeDatabase
};

