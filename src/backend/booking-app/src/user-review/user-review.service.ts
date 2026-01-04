import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReview } from './user-review.entity';
import { User } from '../users/user.entity';
import { CreateUserReviewDto } from './dto/create-user-review.dto';
import { GetUserReviewsDto } from './dto/get-user-reviews.dto';
import { UpdateUserReviewDto } from './dto/update-user-review.dto';
import { UserReviewResponseDto } from './dto/user-review-response.dto';
@Injectable()
export class UserReviewService {
    constructor(
        @InjectRepository(UserReview)
        private readonly reviewRepo: Repository<UserReview>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}

    async createReview(
        reviewerId: number,
        hostId: number,
        dto: CreateUserReviewDto,
    ) {
        if (reviewerId === hostId) {
            throw new BadRequestException('You cannot review yourself');
        }

        const host = await this.userRepo.findOne({
            where: { id: hostId, isHost: true },
        });
        if (!host) {
            throw new NotFoundException('Host not found');
        }

        const reviewer = await this.userRepo.findOne({
            where: { id: reviewerId },
        });
        if (!reviewer) {
            throw new NotFoundException('User not found');
        }

        const review = this.reviewRepo.create({
            reviewer,
            host,
            rating: dto.rating,
            comment: dto.comment,
        });

        try {
            const savedReview = await this.reviewRepo.save(review);
            await this.updateHostRating(hostId); // Cập nhật (tính avg) ở table user trước khi trả về
            return savedReview;
        } catch (error) { // Phòng lỗi user đánh giá 2 lần cho 1 host gây sập database
            if (
            error instanceof QueryFailedError &&
            (error as any).code === '23505'
            ) {
                throw new ConflictException(
                    'You have already reviewed this host',
                );
            }
            throw error;
        }

    }

    //   async getReviewsByHost(hostId: number) {
    //     return this.reviewRepo.find({
    //       where: { host: { id: hostId } },
    //       relations: ['reviewer'],
    //       order: { createdAt: 'DESC' },
    //     });
    //   }
    //
    async getReviewsByHost(
        hostId: number,
        query: GetUserReviewsDto,
    ) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const [reviews, total] = await this.reviewRepo.findAndCount({
            where: { host: { id: hostId } },
            relations: ['reviewer'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });

        const data: UserReviewResponseDto[] =
        reviews.map((review) => this.toResponseDto(review));

        return {
            data,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
        };
    }
    // Mapper để che dấu các thông tin về người dùng quan trọng trong response khi gọi
    // GET hosts/:hostId/reviews
    // tránh lộ Dbschema, frontend phụ thuộc nhiều vào cấu trúc database
    private toResponseDto(
        review: UserReview,
    ): UserReviewResponseDto {
        return {
            id: review.id,
            rating: Number(review.rating),
            comment: review.comment,
            createdAt: review.createdAt,
            reviewer: {
            id: review.reviewer.id,
            fullName: review.reviewer.fullName,
            avatarUrl: review.reviewer.avatarUrl,
            },
        };
    }


    // Cập nhật rating, lấy record từ table review, tính avg rồi để kết quả vào table user
    // Có thể cải thiện bằng thuật toán incremental (ko cần tính avg mỗi lần thêm)
    // nhưng phải cài đặt các trường hợp thêm/sửa/xóa
    async updateHostRating(hostId: number) {
        const result = await this.reviewRepo
            .createQueryBuilder('r')
            .select('ROUND(AVG(r.rating), 3)', 'avg_rating')
            .addSelect('COUNT(*)', 'review_count')
            .where('r.host_id = :hostId', { hostId })
            .getRawOne();

        await this.userRepo.update(hostId, {
            avgRating: result.avg_rating,
            reviewCount: result.review_count,
        });
    }

    // User chỉnh sửa review của mình
    async updateReview(
    reviewerId: number,
    hostId: number,
    reviewId: number,
    dto: UpdateUserReviewDto,
    ) {
        const review = await this.reviewRepo.findOne({
            where: {
            id: reviewId,
            host: { id: hostId },
            },
            relations: ['reviewer', 'host'],
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        if (review.reviewer.id !== reviewerId) {
            throw new ForbiddenException(
            'You can only edit your own review',
            );
        }

        const oldRating = review.rating;
        const newRating =
            dto.rating !== undefined ? dto.rating : oldRating;

        // update fields
        review.rating = newRating;
        if (dto.comment !== undefined) {
            review.comment = dto.comment;
        }

        await this.reviewRepo.save(review);

        // ✅ update avg_rating only if rating changed (theo kiểu incremental để nhanh hơn)
        if (newRating !== oldRating) {
            await this.updateHostRatingAfterEdit(
            hostId,
            oldRating,
            newRating,
            );
        }

        return review;
    }
    async updateHostRatingAfterEdit(
        hostId: number,
        oldRating: number,
        newRating: number,
    ) {
        await this.userRepo
            .createQueryBuilder()
            .update()
            .set({
            avgRating: () =>
                `"avg_rating" + (${newRating} - ${oldRating})::float / "review_count"`,
            })
            .where('id = :hostId', { hostId }) 
            .execute();
    }
}
