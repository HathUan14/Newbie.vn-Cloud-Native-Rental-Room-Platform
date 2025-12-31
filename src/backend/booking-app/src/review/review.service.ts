import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Room } from '../room/entities/room.entity';
import { TransactionStatus, TransactionType } from '../payment/payment.constant';
import { BookingStatus } from '../booking/booking.constant';
import { HostStatsDto } from './dto/host-stats.dto';
import { ChartDataDto } from './dto/chart-data.dto';
import { TopListingDto } from './dto/top-listing.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  create(createReviewDto: CreateReviewDto) {
    return 'This action adds a new review';
  }

  findAll() {
    return `This action returns all review`;
  }

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }

  /**
   * Lấy thống kê tổng quan cho chủ nhà
   */
  async getHostStats(hostId: number): Promise<HostStatsDto> {
    // Lấy danh sách roomIds của host
    const hostRooms = await this.roomRepository.find({
      where: { hostId },
      select: ['id'],
    });
    const roomIds = hostRooms.map((room) => room.id);

    // Tính tổng doanh thu từ Transaction
    const totalRevenueResult = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.booking', 'booking')
      .where('booking.room_id IN (:...roomIds)', { roomIds })
      .andWhere('transaction.status = :status', { status: TransactionStatus.SUCCESS })
      .andWhere('transaction.type = :type', { type: TransactionType.DEPOSIT })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();
      
    const totalRevenue = Number(totalRevenueResult?.total || 0);

    // Tính tổng số lượt xem phòng (viewingRequests)
    const viewingRequestsResult = await this.roomRepository
      .createQueryBuilder('room')
      .where('room.host_id = :hostId', { hostId })
      .select('SUM(room.total_views)', 'total')
      .getRawOne();

    const viewingRequests = Number(viewingRequestsResult?.total || 0);

    // Đếm tổng số booking thành công
    const totalBookings = await this.bookingRepository.count({
      where: {
        roomId: roomIds.length > 0 ? roomIds[0] : undefined,
        status: BookingStatus.CONFIRMED,
      },
    });

    // Tính conversion rate
    const conversionRate = viewingRequests > 0 
      ? (totalBookings / viewingRequests) * 100 
      : 0;

    return {
      totalRevenue,
      viewingRequests,
      conversionRate: Number(conversionRate.toFixed(2)),
    };
  }

  /**
   * Lấy dữ liệu biểu đồ doanh thu theo tháng
   */
  async getRevenueChartData(hostId: number, year: number): Promise<ChartDataDto> {
    // Lấy danh sách roomIds của host
    const hostRooms = await this.roomRepository.find({
      where: { hostId },
      select: ['id'],
    });
    const roomIds = hostRooms.map((room) => room.id);

    if (roomIds.length === 0) {
      return {
        labels: [],
        values: [],
      };
    }

    // Truy vấn doanh thu theo tháng
    const revenueData = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin('transaction.booking', 'booking')
      .where('booking.room_id IN (:...roomIds)', { roomIds })
      .andWhere('transaction.status = :status', { status: TransactionStatus.SUCCESS })
      .andWhere('transaction.type = :type', { type: TransactionType.DEPOSIT })
      .andWhere('EXTRACT(YEAR FROM transaction.created_at) = :year', { year })
      .select('EXTRACT(MONTH FROM transaction.created_at)', 'month')
      .addSelect('SUM(transaction.amount)', 'total')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Tạo mảng 12 tháng
    const monthLabels = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
      'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
      'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    
    const monthValues = new Array(12).fill('0');

    // Fill dữ liệu vào đúng tháng
    revenueData.forEach((row) => {
      const monthIndex = parseInt(row.month) - 1;
      monthValues[monthIndex] = row.total || '0';
    });

    return {
      labels: monthLabels,
      values: monthValues,
    };
  }

  /**
   * Lấy danh sách phòng hiệu quả nhất của host
   */
  async getTopListings(hostId: number, limit: number = 5): Promise<TopListingDto[]> {
    const topRooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('bookings', 'booking', 'booking.room_id = room.room_id')
      .where('room.host_id = :hostId', { hostId })
      .select('room.room_id', 'roomId')
      .addSelect('room.title', 'roomName')
      .addSelect('room.total_views', 'totalViews')
      .addSelect('COUNT(booking.id)', 'totalBookings')
      .groupBy('room.room_id')
      .addGroupBy('room.title')
      .addGroupBy('room.total_views')
      .orderBy('room.total_views', 'DESC')
      .limit(limit)
      .getRawMany();

    return topRooms.map((row) => ({
      roomId: row.roomId,
      roomName: row.roomName,
      totalViews: parseInt(row.totalViews) || 0,
      totalBookings: parseInt(row.totalBookings) || 0,
    }));
  }
}
