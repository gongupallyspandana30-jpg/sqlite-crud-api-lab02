
const express = require("express");
const { initializeDatabase, dbPromise } = require("./database");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// GET API - Retrieve books with search, sorting and filtering
app.get("/books", async (req, res) => {
    try {
        const db = await dbPromise;

        const {
            search_q = "",
            order_by = "book_id",
            order = "ASC",
            limit = "10",
            offset = "0",
            min_price,
            max_price
        } = req.query;

        // Validate sorting
        const allowedColumns = ["book_id", "title", "author", "price"];

        if (!allowedColumns.includes(order_by)) {
            return res.status(400).json({
                message: "Invalid sorting column"
            });
        }

        if (!["ASC", "DESC"].includes(order.toUpperCase())) {
            return res.status(400).json({
                message: "Order must be ASC or DESC"
            });
        }

        // Validate pagination
        const pageLimit = Number(limit);
        const pageOffset = Number(offset);

        if (!Number.isInteger(pageLimit) || pageLimit < 1 ||
            !Number.isInteger(pageOffset) || pageOffset < 0) {
            return res.status(400).json({
                message: "Invalid limit or offset"
            });
        }

        const conditions = [];
        const params = [];

        // Search by title
        if (search_q.trim() !== "") {
            conditions.push("title LIKE ?");
            params.push("%" + search_q + "%");
        }

        // Minimum price
        if (min_price !== undefined) {
            if (min_price.trim() === "" ||
                !Number.isFinite(Number(min_price))) {
                return res.status(400).json({
                    message: "Invalid minimum price"
                });
            }

            conditions.push("price >= ?");
            params.push(Number(min_price));
        }

        // Maximum price
        if (max_price !== undefined) {
            if (max_price.trim() === "" ||
                !Number.isFinite(Number(max_price))) {
                return res.status(400).json({
                    message: "Invalid maximum price"
                });
            }

            conditions.push("price <= ?");
            params.push(Number(max_price));
        }

        if (min_price !== undefined && max_price !== undefined &&
            Number(min_price) > Number(max_price)) {
            return res.status(400).json({
                message: "Minimum price cannot exceed maximum price"
            });
        }

        let sql = "SELECT * FROM book";

        if (conditions.length > 0) {
            sql += " WHERE " + conditions.join(" AND ");
        }

        sql += ` ORDER BY ${order_by} ${order} LIMIT ? OFFSET ?`;

        params.push(pageLimit, pageOffset);

        const books = await db.all(sql, params);

        res.status(200).json(books);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// GET API - Retrieve book by ID
app.get("/books/:id", async (req, res) => {
    try {
        const db = await dbPromise;
        const { id } = req.params;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const book = await db.get(
            "SELECT * FROM book WHERE book_id = ?",
            [id]
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json(book);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// POST API - Add a new book
app.post("/books", async (req, res) => {
    try {
        const db = await dbPromise;
        const { title, author, price } = req.body;

        if (typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            price === undefined || price === null ||
            typeof price === "boolean" ||
            (typeof price !== "number" && String(price).trim() === "") ||
            !Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                message: "Valid title, author and non-negative price are required"
            });
        }

        const result = await db.run(
            "INSERT INTO book (title, author, price) VALUES (?, ?, ?)",
            [title.trim(), author.trim(), Number(price)]
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
        const { title, author, price } = req.body;

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        if (typeof title !== "string" || !title.trim() ||
            typeof author !== "string" || !author.trim() ||
            price === undefined || price === null ||
            typeof price === "boolean" ||
            (typeof price !== "number" && String(price).trim() === "") ||
            !Number.isFinite(Number(price)) || Number(price) < 0) {
            return res.status(400).json({
                message: "Valid title, author and non-negative price are required"
            });
        }

        const result = await db.run(
            `UPDATE book
             SET title = ?, author = ?, price = ?
             WHERE book_id = ?`,
            [title.trim(), author.trim(), Number(price), id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
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

        if (!/^[1-9]\d*$/.test(id)) {
            return res.status(400).json({
                message: "Invalid book ID"
            });
        }

        const result = await db.run(
            "DELETE FROM book WHERE book_id = ?",
            [id]
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Start server
async function startServer() {
    try {
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Database initialization error:", error.message);
    }
}

startServer();
