
const express = require("express");

const { initializeDatabase } = require("./database");

const app = express();

app.use(express.json());

const { dbPromise } = require("./database");

// GET API - Retrieve all books
app.get("/books/", async (req, res) => {
    try {
        const db = await dbPromise;

        const books = await db.all(
            "SELECT * FROM book"
        );

        res.json(books);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// GET API - Retrieve a book by ID
app.get("/books/:id", async (req, res) => {
    try {
        const db = await dbPromise;

        const { id } = req.params;

        const book = await db.get(
            "SELECT * FROM book WHERE book_id = ?",
            [id]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json(book);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// POST API - Add a new book
app.post("/books/", async (req, res) => {
    try {
        const db = await dbPromise;

        const { title, author } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                message: "Title and author are required"
            });
        }

        const result = await db.run(
            "INSERT INTO book (title, author) VALUES (?, ?)",
            [title, author]
        );

        res.status(201).json({
            message: "Book added successfully",
            book_id: result.lastID
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

 // PUT API - Update an existing book
app.put("/books/:id", async (req, res) => {
    try {
        const db = await dbPromise;

        const { id } = req.params;
        const { title, author } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                message: "Title and author are required"
            });
        }

        const result = await db.run(
            "UPDATE book SET title = ?, author = ? WHERE book_id = ?",
            [title, author, id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book updated successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

 // DELETE API - Delete a book
app.delete("/books/:id", async (req, res) => {
    try {
        const db = await dbPromise;

        const { id } = req.params;

        const result = await db.run(
            "DELETE FROM book WHERE book_id = ?",
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Error:", error.message);
    }
}
startServer();
