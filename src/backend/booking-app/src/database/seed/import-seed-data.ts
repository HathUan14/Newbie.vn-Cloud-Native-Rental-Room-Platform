// import { DataSource } from 'typeorm';
// import * as dotenv from 'dotenv';
// import { seedTransactionData } from '../../payment/entities/seed-transactions';

// // Import tất cả các Entity liên quan
// import { User } from '../../user/user.entity'; // Sửa lại đường dẫn cho đúng
// import { Room } from '../../room/entities/room.entity';
// import { Booking } from '../../booking/entities/booking.entity';
// import { Review } from '../../review/entities/review.entity';
// import { UserReview } from '../../user-review/user-review.entity';
// import { RoomImage } from '../../room/entities/room-image.entity';
// import { RoomAmenity } from '../../room/entities/room-amenity.entity';
// import { Amenity } from '../../room/entities/amenity.entity';
// import { Dispute } from "../../dispute/entities/dispute.entity";
// import { Transaction } from '../../payment/entities/transaction.entity';
// dotenv.config();

// async function main() {
//   const DATABASE_URL = process.env.DATABASE_URL;

//   if (!DATABASE_URL) {
//     console.error('❌ Lỗi: DATABASE_URL không tìm thấy trong .env');
//     process.exit(1);
//   }

//   const dataSource = new DataSource({
//     type: 'postgres',
//     url: DATABASE_URL,
//     // QUAN TRỌNG: Phải khai báo entities ở đây
//     entities: [User, Room, Booking, Review, UserReview, RoomImage, RoomAmenity, Amenity, Dispute],
//     synchronize: false,
//     logging: false, // Bật true nếu muốn xem câu lệnh SQL chạy ngầm
//   });

//   try {
//     console.log('🚀 Đang kết nối Database...');
//     await dataSource.initialize();
//     console.log('✅ Kết nối thành công!');

//     console.log('\n📝 Đang bắt đầu seed transaction data...');
//     await seedTransactionData(dataSource);

//     console.log('\n✨ Chúc mừng! Dữ liệu đã được seed thành công để demo.');
//   } catch (error) {
//     console.error('❌ Lỗi trong quá trình seed:', error);
//   } finally {
//     await dataSource.destroy(); // Đóng kết nối sau khi xong
//   }
// }

// main();

import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function importCSV(dataSource: DataSource, tableName: string, csvFilePath: string) {
  const results: any[] = [];

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          if (results.length === 0) {
            console.log(`⚠️  ${tableName}: Không có dữ liệu`);
            resolve();
            return;
          }

          // Chèn từng bản ghi
          for (const row of results) {
            const columns = Object.keys(row).filter(key => row[key] !== '');
            const values = columns.map(col => row[col]);
            
            const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
            const columnsStr = columns.map(col => `"${col}"`).join(', ');
            
            const query = `INSERT INTO "${tableName}" (${columnsStr}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
            
            await dataSource.query(query, values);
          }

          console.log(`✅ ${tableName}: Đã import ${results.length} bản ghi`);
          resolve();
        } catch (error) {
          console.error(`❌ Lỗi khi import ${tableName}:`, error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function main() {
  // Load environment variables
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ Lỗi: DATABASE_URL không được tìm thấy trong .env');
    console.error('Vui lòng kiểm tra file .env và đảm bảo có DATABASE_URL');
    process.exit(1);
  }

  console.log('📝 DATABASE_URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Ẩn password

  // Tạo kết nối database
  const dataSource = new DataSource({
    type: 'postgres',
    url: DATABASE_URL,
    synchronize: false,
  });

  try {
    console.log('🔌 Đang kết nối database...');
    await dataSource.initialize();
    console.log('✅ Đã kết nối database\n');

    const seedDir = __dirname;

    // Import theo thứ tự phụ thuộc
    console.log('📥 Bắt đầu import dữ liệu...\n');

    // 1. Users (không phụ thuộc vào bảng nào)
    await importCSV(dataSource, 'users', path.join(seedDir, 'users.csv'));

    // 2. Amenities (không phụ thuộc vào bảng nào)
    await importCSV(dataSource, 'amenities', path.join(seedDir, 'amenities.csv'));

    // 3. Rooms (phụ thuộc vào Users)
    await importCSV(dataSource, 'rooms', path.join(seedDir, 'rooms.csv'));

    // 4. Room Images (phụ thuộc vào Rooms)
    await importCSV(dataSource, 'room_images', path.join(seedDir, 'room_images.csv'));

    // 5. Room Amenities (phụ thuộc vào Rooms và Amenities)
    await importCSV(dataSource, 'room_amenities', path.join(seedDir, 'room_amenities.csv'));

    // 6. Bookings (phụ thuộc vào Users và Rooms)
    await importCSV(dataSource, 'bookings', path.join(seedDir, 'bookings.csv'));

    //7. Reviews (phụ thuộc vào Users và Bookings)
    await importCSV(dataSource, 'reviews', path.join(seedDir, 'reviews.csv'));
    
    console.log('\n🎉 Hoàn thành import dữ liệu!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

main();