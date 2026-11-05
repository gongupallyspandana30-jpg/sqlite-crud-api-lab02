# Lab 3: REST API, Query Parameters, Validation and Debugging

**Student Name:** Gongupally Spandana  
**Registration Number:** 252U1R6082   
**Section:** AIML-2B

## Objective
To develop a REST API with search, sorting, filtering, input validation and proper HTTP status codes.

## Technologies Used
- Node.js
- Express.js
- SQLite
- Postman
- VS Code

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /books | Retrieve all books |
| GET | /books?search_q= | Search books |
| GET | /books?min_price=&max_price= | Filter by price |
| POST | /books | Add a new book |
| PUT | /books/:id | Update a book |
| DELETE | /books/:id | Delete a book |

## How to Run
1. Install Node.js.
2. Open the project folder in VS Code.
3. Install dependencies using `npm install`.
4. Start the server using `node app.js`.
5. Open Postman and test the API endpoints.

## Validation
- Missing title or author returns 400.
- Invalid price returns 400.
- Successful creation returns 201.
- Successful update and deletion return 200.
- Missing book ID returns 404.

## Debugging
Fixed common errors such as port conflicts, incorrect import paths, database table-name errors and missing await statements.

## Screenshots
Postman screenshots are available in the screenshots folder.

## Conclusion
Successfully developed a REST API that supports CRUD operations, searching, sorting, price filtering and input validation with appropriate HTTP status codes.
## Live Deployment

**Deployment Platform:** Render

**Live API URL:**  
https://sqlite-crud-api-lab02-3.onrender.com

**Books Endpoint:**  
https://sqlite-crud-api-lab02-3.onrender.com/books