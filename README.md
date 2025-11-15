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

### 3. Migration (change database tables structure)
- Create dir src/migrations, create typeorm.config.ts in project backend dir
- Add to script section of package.json `"typeorm": "typeorm-ts-node-commonjs -d typeorm.config.ts"`
- `npm run build` -> create /dist
- `npm run typeorm migration:generate src/migrations/add_moderation_status` -> create migration file in src/migrations
- `npm run build`
- `npm run typeorm migration:run` -> update table on Neon console

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
- Landlord viewing his own room post: GET localhost:3000/posts/my-listings
- (for testing, remmember adding at Headers a new section: key: Authorization, value: Bear <access_token_you_can_get_by_POST:http://localhost:3000/auth/login>)
```json
{
	"meta": {
		"total": 7,
		"page": 1,
		"limit": 10,
		"totalPages": 1
	},
	"data": [
		{
			"id": 36,
			"title": "Nhà nguyên căn 3PN, 80m2, gần biển, Sơn Trà, Đà Nẵng",
			"district": "Sơn Trà",
			"city": "Đà Nẵng",
			"pricePerMonth": "14000000.00",
			"status": "available",
			"moderationStatus": "pending",
			"createdAt": "2025-11-01T11:19:02.976Z",
			"roomType": {
				"id": 16,
				"name": "Nhà nguyên căn"
			},
			"images": [
				{
					"id": 213,
					"roomId": 36,
					"imageUrl": "phongtro_31_3.jpg",
					"isThumbnail": false
				},
			],
			"roomAmenities": [
				{
					"roomId": 36,
					"amenityId": 44
				},
			]
		},
	]
}
```
### 4. JWT Admin Session Check with Insomnia
1. **Back-end**
- To test tasks that need admin privillege, use the JWT Bearer Token in Insomnia.
- Assume that there is an admin account created in the database.
For example:
```json
{
	"email": "nguyenvanphuoc1172@gmail.com",
	"password": "123456"
}
```
- Do these operations, respectively:
	+ Login into server with admin account: POST http://localhost:3000/auth/login
	+ If this form show up in the Preview tab, copy the Access Token
	```json
	{
	"success": true,
	"message": "Login successfully",
	"data": {
		"id": 9,
		"email": "nguyenvanphuoc1172@gmail.com",
		"fullName": "Nguyen Van Phuoc",
		"isActive": false,
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksImVtYWlsIjoibmd1eWVudmFucGh1b2MxMTcyQGdtYWlsLmNvbSIsImlhdCI6MTc2MzE3NDcwOCwiZXhwIjoxNzYzMTc4MzA4fQ.VEf6XJUlMmmmuDqr7aYXggRiTRagQcQgbvMNZIxMngo",
		"isHost": false,
		"isAdmin": true
		}
	}
```
	+ At Auth tab, choose Bearer Token from the list and then, paste the token into Token emulation
	+ Now you can test APIs with admin privilege:
		GET /admin/posts/pending
		PUT /admin/posts/approve/{id}
		PUT /admin/posts/reject/{id}
		PUT /admin/posts/request-edit/{id}
		
2. **Front-end**

---
### 4. Project features
---
### 5. References