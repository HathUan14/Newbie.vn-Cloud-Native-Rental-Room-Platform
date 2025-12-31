import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mảng comment mẫu cho mỗi mức rating
const comments = {
  1: [
    'Phòng rất tệ, không giống hình ảnh',
    'Chủ nhà không thân thiện, phòng bẩn',
    'Không đáng tiền, cơ sở vật chất quá tệ',
    'Rất thất vọng, không khuyến khích thuê',
    'Phòng có mùi ẩm mốc, không sạch sẽ',
  ],
  2: [
    'Phòng cần cải thiện nhiều',
    'Giá hơi cao so với chất lượng',
    'Vị trí không thuận tiện lắm',
    'Phòng nhỏ hơn mô tả',
    'Cần nâng cấp thêm tiện nghi',
  ],
  3: [
    'Phòng tạm ổn, giá cả hợp lý',
    'Vị trí khá tốt nhưng phòng hơi nhỏ',
    'Chủ nhà thân thiện, phòng sạch sẽ',
    'Đủ dùng cho sinh viên',
    'Không có gì đặc biệt nhưng cũng không tệ',
  ],
  4: [
    'Phòng rất đẹp, sạch sẽ và thoáng mát',
    'Chủ nhà tốt bụng, phòng đầy đủ tiện nghi',
    'Vị trí thuận lợi, gần chợ và trường học',
    'Giá hợp lý, phòng rộng rãi',
    'Rất hài lòng với chất lượng phòng',
  ],
  5: [
    'Phòng tuyệt vời! Rất đáng tiền!',
    'Chủ nhà nhiệt tình, phòng như mô tả',
    'Không thể tốt hơn! Sẽ giới thiệu bạn bè',
    'Phòng đẹp lung linh, tiện nghi hiện đại',
    'Hoàn hảo! Vị trí đẹp, phòng sạch, giá tốt',
    'Rất hài lòng, sẽ ở dài hạn!',
  ],
};

async function seedReviews() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ Lỗi: DATABASE_URL không được tìm thấy trong .env');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: DATABASE_URL,
    synchronize: false,
  });

  try {
    console.log('🔌 Đang kết nối database...');
    await dataSource.initialize();
    console.log('✅ Đã kết nối database\n');

    // Lấy danh sách bookings có sẵn
    const bookings = await dataSource.query(`
      SELECT b.id as booking_id, b.renter_id, b.room_id
      FROM bookings b
      WHERE b.status IN ('CONFIRMED', 'APPROVED')
      ORDER BY b.id
    `);

    if (bookings.length === 0) {
      console.error('❌ Không có booking nào để tạo review!');
      console.log('💡 Hãy đảm bảo có dữ liệu bookings trong database');
      process.exit(1);
    }

    console.log(`📊 Tìm thấy ${bookings.length} bookings`);
    console.log('🔄 Bắt đầu tạo 100 reviews ngẫu nhiên...\n');

    let createdCount = 0;
    const totalReviews = 100;

    for (let i = 0; i < totalReviews; i++) {
      // Chọn ngẫu nhiên một booking
      const booking = bookings[Math.floor(Math.random() * bookings.length)];
      
      // Random rating từ 1 đến 5
      const rating = Math.floor(Math.random() * 5) + 1;
      
      // Random comment từ mảng tương ứng với rating
      const commentList = comments[rating as keyof typeof comments];
      const comment = commentList[Math.floor(Math.random() * commentList.length)];

      // Random ngày tạo trong 6 tháng gần đây
      const daysAgo = Math.floor(Math.random() * 180);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      try {
        await dataSource.query(`
          INSERT INTO reviews (booking_id, renter_id, room_id, rating, comment, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          booking.booking_id,
          booking.renter_id,
          booking.room_id,
          rating,
          comment,
          createdAt
        ]);

        createdCount++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Đã tạo ${i + 1}/${totalReviews} reviews...`);
        }
      } catch (error: any) {
        // Bỏ qua lỗi nếu review đã tồn tại
        if (!error.message.includes('duplicate')) {
          console.error(`⚠️  Lỗi khi tạo review ${i + 1}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã tạo ${createdCount} reviews`);

    // Thống kê rating
    const stats = await dataSource.query(`
      SELECT rating, COUNT(*) as count
      FROM reviews
      GROUP BY rating
      ORDER BY rating
    `);

    console.log('\n📊 Thống kê rating:');
    stats.forEach((stat: any) => {
      const stars = '⭐'.repeat(stat.rating);
      console.log(`${stars} (${stat.rating} sao): ${stat.count} reviews`);
    });

    await dataSource.destroy();
    console.log('\n✅ Đóng kết nối database');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seedReviews();
