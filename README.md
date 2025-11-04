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
- Room search api may like this: GET: http://localhost:3000/rooms?city=Hà Nội&sort=pricePerMonth:ASC&maxPrice=5000000&roomTypeId=13&amenities=41,40&keyword=Sinh viên
```json
{
	"total": 1,
	"page": 1,
	"limit": 10,
	"totalPages": 1,
	"data": [
		{
			"id": 6,
			"hostId": 1,
			"roomTypeId": 13,
			"title": "Phòng trọ giá SV 20m2 gần ĐH Hà Nội",
			"description": "Phòng 20m2, khép kín, có nóng lạnh. Không chung chủ. Gần ĐH Hà Nội, Bưu chính. Ưu tiên sinh viên. Cọc 1 tháng.",
			"area_sqm": 20,
			"addressStreet": "77 Chiến Thắng",
			"ward": "Phường Văn Quán",
			"district": "Hà Đông",
			"city": "Hà Nội",
			"pricePerMonth": "2500000.00",
			"depositAmount": "2500000.00",
			"guestCapacity": 2,
			"alleyDescription": "Mặt tiền đường Chiến Thắng",
			"status": "available",
			"aiLocationRating": null,
			"aiLocationNotes": null,
			"aiFireRiskLevel": null,
			"createdAt": "2025-11-01T11:18:53.946Z",
			"updatedAt": "2025-11-01T11:18:53.946Z",
			"roomType": {
				"id": 13,
				"name": "Phòng trọ"
			},
			"images": [
				{
					"id": 1,
					"roomId": 6,
					"imageUrl": "phongtro_1_1.jpg",
					"isThumbnail": true
				},
				{
					"id": 2,
					"roomId": 6,
					"imageUrl": "phongtro_1_2.jpg",
					"isThumbnail": false
				}
			],
			"roomAmenities": [
				{
					"roomId": 6,
					"amenityId": 39,
					"amenity": {
						"id": 39,
						"name": "Nóng lạnh"
					}
				},
				{
					"roomId": 6,
					"amenityId": 40,
					"amenity": {
						"id": 40,
						"name": "WC riêng"
					}
				}
			]
		}
	]
}
```
2. **Front-end**

---
### 4. Project features
---
### 5. References