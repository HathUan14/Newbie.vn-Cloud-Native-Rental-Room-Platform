## Booking App - A website that help searching for good accomodation

*Intoduction to Software Engineering - Group 5 - Newbie*

### 1. Project Structure
```
📦 introduction-SE/
┣ 📂 pa/     # Project documents and timelines
┣ 📂 src/    # Source code
┃ ┣ 📂 backend/     # Server-side (NestJS)
┃ ┣ 📂 frontend/    # Client-side (React)
┃ ┃ ┣ 📂 src/
┃ ┃ ┃ ┣ 📄 App.jsx
┃ ┃ ┃ ┗ 📄 index.html
┃ ┃ ┣ 📄 package.json
┃ ┃ ┗ 📄 vite.config.js
┣ 📄 README.md
┗ 📄 LICENSE
 ```
---

### 2. Setting up and Running

1. **Back-end**
- If there is an *system* error, use command<br>
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
- Change directory to \src\backend\booking-app
- `npm install` for installing useful modules and dependencies
- `npm run start:dev` for running backend server in developer mode (display changes)

2. **Front-end**


### 3. Operations
1. **Back-end**
- Login (Also account test): POST: http://localhost:3000/auth/login 
```json
{
    "email": "test@example.com",
    "password": "123456"
}
```
- Register: POST: http://localhost:3000/auth/register 
```json
{
    "email": "test@example.com",
    "fullName": "Nguyen Van A",
    "password": "123456"
}
```
2. **Front-end**

---
### 4. Project features
---
### 5. References