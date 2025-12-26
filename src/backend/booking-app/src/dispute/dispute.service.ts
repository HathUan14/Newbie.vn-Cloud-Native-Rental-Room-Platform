import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { Booking } from '../booking/entities/booking.entity';
import { BookingStatus } from '../booking/booking.constant';
import { User } from '../users/user.entity';

@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Dispute cho Guest
   * Logic:
   * 1. Kiểm tra booking tồn tại
   * 2. Xác minh user là renter của booking
   * 3. Kiểm tra booking có trạng thái hợp lệ (CONFIRMED hoặc APPROVED)
   * 4. Đảm bảo chưa có dispute nào cho booking này
   * 5. Tạo dispute mới với status PENDING_REVIEW
   */
  async createDispute(
    createDisputeDto: CreateDisputeDto,
    renterId: number,
  ): Promise<Dispute> {
    const { bookingId, reason } = createDisputeDto;

    // 1. Kiểm tra booking tồn tại
    const booking = await this.bookingRepository.findOne({
      where: { id: Number(bookingId) },
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking với ID ${bookingId} không tồn tại`,
      );
    }

    // 2. Xác minh user là renter của booking
    if (booking.renterId !== renterId) {
      throw new ForbiddenException(
        'Bạn không có quyền tạo dispute cho booking này',
      );
    }

    // 3. Kiểm tra booking có trạng thái hợp lệ
    const validStatuses = [BookingStatus.CONFIRMED, BookingStatus.APPROVED];
    if (!validStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Chỉ có thể tạo dispute cho booking có trạng thái CONFIRMED hoặc APPROVED. Trạng thái hiện tại: ${booking.status}`,
      );
    }

    // 4. Đảm bảo chưa có dispute nào cho booking này
    const existingDispute = await this.disputeRepository.findOne({
      where: { bookingId: Number(bookingId) },
    });

    if (existingDispute) {
      throw new BadRequestException(
        `Booking này đã có dispute với ID ${existingDispute.id}`,
      );
    }

    // 5. Tạo dispute mới
    const dispute = this.disputeRepository.create({
      bookingId: Number(bookingId),
      renterId,
      reason,
      status: DisputeStatus.PENDING_REVIEW,
      refundAmount: 0,
    });

    return await this.disputeRepository.save(dispute);
  }

  /**
   * Xử lý dispute cho Admin
   * Logic:
   * 0. Kiểm tra quyền admin
   * 1. Kiểm tra dispute tồn tại
   * 2. Kiểm tra dispute đang ở trạng thái PENDING_REVIEW
   * 3. Cập nhật status, adminDecisionNote, và refundAmount
   * 4. Nếu RESOLVED_REFUND, validate refundAmount <= depositAmount
   * 5. Lưu thông tin quyết định của admin
   */
  async resolveDispute(
    disputeId: number,
    resolveDisputeDto: ResolveDisputeDto,
    adminId: number,
  ): Promise<Dispute> {
    const { status, reason, refundAmount } = resolveDisputeDto;

    // 0. Kiểm tra quyền admin
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || !admin.isAdmin) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập. Chỉ admin mới có thể giải quyết dispute',
      );
    }

    // 1. Kiểm tra dispute tồn tại
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
      relations: ['booking'],
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute với ID ${disputeId} không tồn tại`);
    }

    // 2. Kiểm tra dispute đang ở trạng thái PENDING_REVIEW
    if (dispute.status !== DisputeStatus.PENDING_REVIEW) {
      throw new BadRequestException(
        `Dispute này đã được xử lý với trạng thái: ${dispute.status}`,
      );
    }

    // 3. Validate refundAmount nếu status là RESOLVED_REFUND
    if (status === DisputeStatus.RESOLVED_REFUND) {
      if (refundAmount <= 0) {
        throw new BadRequestException(
          'Số tiền hoàn trả phải lớn hơn 0 khi chấp nhận dispute',
        );
      }

      // Kiểm tra refundAmount không vượt quá depositAmount
      if (dispute.booking && refundAmount > dispute.booking.depositAmount) {
        throw new BadRequestException(
          `Số tiền hoàn trả (${refundAmount}) không được vượt quá số tiền đặt cọc (${dispute.booking.depositAmount})`,
        );
      }
    }

    // 4. Cập nhật dispute
    dispute.status = status;
    dispute.adminDecisionNote = reason;
    dispute.refundAmount = refundAmount;

    return await this.disputeRepository.save(dispute);
  }

  /**
   * Lấy danh sách các dispute đang chờ xử lý
   * Trả về mảng các dispute có status PENDING_REVIEW
   */
  async getPendingDisputes(): Promise<Dispute[]> {
    return await this.disputeRepository.find({
      where: { status: DisputeStatus.PENDING_REVIEW },
      relations: ['booking', 'renter'],
      order: { createdAt: 'DESC' },
    });
  }
}