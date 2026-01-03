import { Module } from '@nestjs/common';
import { UserReviewController } from './user-review.controller';
import { UserReviewService } from './user-review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReview } from './user-review.entity';
import { User } from 'src/users/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserReview, User]),
    AuthModule
],
  controllers: [UserReviewController],
  providers: [UserReviewService]
})
export class UserReviewModule {}
