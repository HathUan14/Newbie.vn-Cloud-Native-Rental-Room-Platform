import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { HostDashboardService } from './host-dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { HostStatsDto } from '../review/dto/host-stats.dto';
import { ChartDataDto } from '../review/dto/chart-data.dto';
import { TopListingDto } from '../review/dto/top-listing.dto';

@Controller('host-dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('host', 'admin')
export class HostDashboardController {
  constructor(private readonly hostDashboardService: HostDashboardService) {}

  /**
   * GET /host-dashboard/stats
   * Lấy các chỉ số thống kê chính cho host
   */
  @Get('stats')
  async getStats(@Request() req): Promise<HostStatsDto> {
    const hostId = req.user.id;
    return this.hostDashboardService.getKeyMetrics(hostId);
  }

  /**
   * GET /host-dashboard/chart?year=2024
   * Lấy dữ liệu biểu đồ doanh thu theo tháng
   */
  @Get('chart')
  async getChart(
    @Request() req,
    @Query('year') year?: number,
  ): Promise<ChartDataDto> {
    const hostId = req.user.id;
    const targetYear = year || new Date().getFullYear();
    return this.hostDashboardService.getRevenueChart(hostId, targetYear);
  }

  /**
   * GET /host-dashboard/top-listings?limit=5
   * Lấy danh sách phòng hiệu quả nhất
   */
  @Get('top-listings')
  async getTopListings(
    @Request() req,
    @Query('limit') limit?: number,
  ): Promise<TopListingDto[]> {
    const hostId = req.user.id;
    return this.hostDashboardService.getTopListings(hostId, limit || 5);
  }
}
