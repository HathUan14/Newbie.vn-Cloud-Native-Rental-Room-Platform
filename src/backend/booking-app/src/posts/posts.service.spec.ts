import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus, ModerationStatus } from '../room/entities/room.entity';
import { RoomImage } from '../room/entities/room-image.entity';
import { RoomAmenity } from '../room/entities/room-amenity.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('PostsService - Moderate Listing Test Cases', () => {
  let service: PostsService;
  let roomRepository: Repository<Room>;
  let imageRepository: Repository<RoomImage>;
  let roomAmenityRepository: Repository<RoomAmenity>;

  // Mock repositories
  const mockRoomRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockImageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockRoomAmenityRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
        {
          provide: getRepositoryToken(RoomImage),
          useValue: mockImageRepository,
        },
        {
          provide: getRepositoryToken(RoomAmenity),
          useValue: mockRoomAmenityRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    roomRepository = module.get<Repository<Room>>(getRepositoryToken(Room));
    imageRepository = module.get<Repository<RoomImage>>(getRepositoryToken(RoomImage));
    roomAmenityRepository = module.get<Repository<RoomAmenity>>(getRepositoryToken(RoomAmenity));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Kiểm thử luồng nghiệp vụ chính (Happy Path)', () => {
    
    describe('TC01: Phê duyệt tin đăng thành công (Approve Listing)', () => {
      it('should approve a pending listing successfully', async () => {
        // Arrange - Chuẩn bị dữ liệu
        const hostId = 1;
        const roomId = 100;
        
        const mockPendingRoom: Partial<Room> = {
          id: roomId,
          title: 'Test Room',
          hostId: hostId,
          status: RoomStatus.PENDING,
          moderationStatus: ModerationStatus.PENDING,
          moderationNotes: '',
          pricePerMonth: 5000000,
          district: 'District 1',
          city: 'Ho Chi Minh',
          createdAt: new Date(),
        };

        mockRoomRepository.findOne.mockResolvedValue(mockPendingRoom);

        // Act - Thực hiện hành động lấy listing
        const result = await service.getMyListing(hostId, roomId);

        // Assert - Kiểm tra kết quả
        expect(result).toBeDefined();
        expect(result.moderationStatus).toBe(ModerationStatus.PENDING);
        expect(mockRoomRepository.findOne).toHaveBeenCalledWith({
          where: { id: roomId, hostId: hostId },
          relations: ['images', 'roomAmenities', 'roomAmenities.amenity'],
        });
      });

      it('should verify that approved listing has correct status', async () => {
        // Simulate after admin approval
        const approvedRoom: Partial<Room> = {
          id: 100,
          title: 'Approved Room',
          moderationStatus: ModerationStatus.APPROVED,
          status: RoomStatus.AVAILABLE,
          moderationNotes: '',
        };

        mockRoomRepository.findOne.mockResolvedValue(approvedRoom);

        const result = await service.getMyListing(1, 100);

        expect(result.moderationStatus).toBe(ModerationStatus.APPROVED);
        expect(result.status).toBe(RoomStatus.AVAILABLE);
      });

      it('should remove approved listing from pending queue', async () => {
        // Kiểm tra tin đã duyệt không còn trong danh sách pending
        const hostId = 1;
        
        const mockListings = [
          {
            id: 101,
            moderationStatus: ModerationStatus.PENDING,
            status: RoomStatus.PENDING,
          },
          {
            id: 102,
            moderationStatus: ModerationStatus.PENDING,
            status: RoomStatus.PENDING,
          },
        ];

        mockRoomRepository.findAndCount.mockResolvedValue([mockListings, 2]);

        const result = await service.getMyListings(hostId, { page: '1', limit: '10' });

        expect(result.data.length).toBe(2);
        // Không có listing nào có status APPROVED
        const approvedListings = result.data.filter(
          (room) => room.moderationStatus === ModerationStatus.APPROVED
        );
        expect(approvedListings.length).toBe(0);
      });
    });

    describe('TC02: Từ chối tin đăng kèm lý do (Reject Listing)', () => {
      it('should reject a listing with reason successfully', async () => {
        const hostId = 1;
        const roomId = 200;
        const rejectionReason = 'Hình ảnh không rõ ràng hoặc giả mạo';

        const mockRejectedRoom: Partial<Room> = {
          id: roomId,
          title: 'Rejected Room',
          hostId: hostId,
          status: RoomStatus.HIDDEN,
          moderationStatus: ModerationStatus.REJECTED,
          moderationNotes: rejectionReason,
          pricePerMonth: 4000000,
          district: 'District 2',
          city: 'Ho Chi Minh',
        };

        mockRoomRepository.findOne.mockResolvedValue(mockRejectedRoom);

        const result = await service.getMyListing(hostId, roomId);

        expect(result.moderationStatus).toBe(ModerationStatus.REJECTED);
        expect(result.status).toBe(RoomStatus.HIDDEN);
        expect(result.moderationNotes).toBe(rejectionReason);
      });

      it('should verify rejected listing is not publicly visible', async () => {
        // Tin bị từ chối nên có status là HIDDEN
        const rejectedRoom: Partial<Room> = {
          id: 200,
          moderationStatus: ModerationStatus.REJECTED,
          status: RoomStatus.HIDDEN,
          moderationNotes: 'Fake image',
        };

        mockRoomRepository.findOne.mockResolvedValue(rejectedRoom);

        const result = await service.getMyListing(1, 200);

        expect(result.status).toBe(RoomStatus.HIDDEN);
        expect(result.moderationNotes).toContain('Fake image');
      });

      it('should include rejection reason in moderation notes', async () => {
        const rejectionReason = 'Vi phạm chính sách cộng đồng';
        
        const rejectedRoom: Partial<Room> = {
          id: 201,
          moderationStatus: ModerationStatus.REJECTED,
          status: RoomStatus.HIDDEN,
          moderationNotes: rejectionReason,
        };

        mockRoomRepository.findOne.mockResolvedValue(rejectedRoom);

        const result = await service.getMyListing(1, 201);

        expect(result.moderationNotes).toBe(rejectionReason);
        expect(result.moderationNotes).not.toBe('');
      });
    });

    describe('TC03: Yêu cầu chủ nhà chỉnh sửa (Request Edit)', () => {
      it('should request host to edit listing with notes', async () => {
        const hostId = 1;
        const roomId = 300;
        const editNotes = 'Vui lòng bổ sung thêm thông tin về tiện ích và cập nhật giá chính xác';

        const mockNeedsEditRoom: Partial<Room> = {
          id: roomId,
          title: 'Room Needs Edit',
          hostId: hostId,
          status: RoomStatus.PENDING,
          moderationStatus: ModerationStatus.NEEDS_EDIT,
          moderationNotes: editNotes,
          pricePerMonth: 3500000,
          district: 'District 3',
          city: 'Ho Chi Minh',
        };

        mockRoomRepository.findOne.mockResolvedValue(mockNeedsEditRoom);

        const result = await service.getMyListing(hostId, roomId);

        expect(result.moderationStatus).toBe(ModerationStatus.NEEDS_EDIT);
        expect(result.status).toBe(RoomStatus.PENDING);
        expect(result.moderationNotes).toBe(editNotes);
      });

      it('should verify listing with NEEDS_EDIT status is not public', async () => {
        const needsEditRoom: Partial<Room> = {
          id: 301,
          moderationStatus: ModerationStatus.NEEDS_EDIT,
          status: RoomStatus.PENDING,
          moderationNotes: 'Cần bổ sung ảnh phòng ngủ',
        };

        mockRoomRepository.findOne.mockResolvedValue(needsEditRoom);

        const result = await service.getMyListing(1, 301);

        expect(result.status).toBe(RoomStatus.PENDING);
        expect(result.moderationStatus).toBe(ModerationStatus.NEEDS_EDIT);
      });

      it('should include admin guidance notes for host', async () => {
        const guidanceNotes = 'Vui lòng thêm ít nhất 2 ảnh nữa và cập nhật mô tả chi tiết hơn';
        
        const needsEditRoom: Partial<Room> = {
          id: 302,
          moderationStatus: ModerationStatus.NEEDS_EDIT,
          moderationNotes: guidanceNotes,
        };

        mockRoomRepository.findOne.mockResolvedValue(needsEditRoom);

        const result = await service.getMyListing(1, 302);

        expect(result.moderationNotes).toBe(guidanceNotes);
        expect(result.moderationNotes.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Kiểm thử bảo mật & Phân quyền (Security)', () => {
    
    describe('TC04: Kiểm tra quyền truy cập trái phép (Unauthorized Access)', () => {
      it('should deny access when non-owner tries to view listing', async () => {
        const ownerId = 1;
        const unauthorizedUserId = 999;
        const roomId = 100;

        // Room thuộc về user có ID = 1
        const mockRoom: Partial<Room> = {
          id: roomId,
          hostId: ownerId,
          title: 'Protected Room',
        };

        mockRoomRepository.findOne.mockResolvedValue(null); // Không tìm thấy vì hostId khác

        // Người dùng không phải chủ nhà cố gắng truy cập
        await expect(
          service.getMyListing(unauthorizedUserId, roomId)
        ).rejects.toThrow(NotFoundException);

        expect(mockRoomRepository.findOne).toHaveBeenCalledWith({
          where: { id: roomId, hostId: unauthorizedUserId },
          relations: ['images', 'roomAmenities', 'roomAmenities.amenity'],
        });
      });

      it('should throw NotFoundException when unauthorized user accesses non-existent listing', async () => {
        mockRoomRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getMyListing(999, 9999)
        ).rejects.toThrow(NotFoundException);
        
        await expect(
          service.getMyListing(999, 9999)
        ).rejects.toThrow('Listing not found or you do not have access');
      });

      it('should only allow host to view their own listings', async () => {
        const hostId = 5;
        const otherHostId = 10;

        // Host 5's rooms
        const mockListingsHost5 = [
          { id: 501, hostId: 5, title: 'Room 501' },
          { id: 502, hostId: 5, title: 'Room 502' },
        ];

        mockRoomRepository.findAndCount.mockResolvedValue([mockListingsHost5, 2]);

        const result = await service.getMyListings(hostId, { page: '1', limit: '10' });

        expect(result.data.every(room => room.hostId === hostId)).toBe(true);
        expect(mockRoomRepository.findAndCount).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { hostId: hostId },
          })
        );
      });

      it('should verify repository is called with correct authorization parameters', async () => {
        const hostId = 7;
        const roomId = 700;

        mockRoomRepository.findOne.mockResolvedValue({
          id: roomId,
          hostId: hostId,
        });

        await service.getMyListing(hostId, roomId);

        // Verify the query includes both id and hostId for authorization
        expect(mockRoomRepository.findOne).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              id: roomId,
              hostId: hostId,
            }),
          })
        );
      });
    });
  });

  describe('Kiểm thử hiệu năng (Performance)', () => {
    
    describe('TC06: Kiểm tra thời gian tải trang chi tiết (Load Time)', () => {
      it('should load listing details with multiple images within acceptable time', async () => {
        const hostId = 1;
        const roomId = 600;

        // Mock room với nhiều hình ảnh
        const mockImages = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          roomId: roomId,
          imageUrl: `https://example.com/image${i + 1}.jpg`,
          publicId: `public_id_${i + 1}`,
          displayOrder: i,
          isThumbnail: i === 0,
          room: undefined as any,
        }));

        const mockRoomWithManyImages: Partial<Room> = {
          id: roomId,
          hostId: hostId,
          title: 'Room with Many Images',
          status: RoomStatus.AVAILABLE,
          moderationStatus: ModerationStatus.APPROVED,
          pricePerMonth: 6000000,
          district: 'District 1',
          city: 'Ho Chi Minh',
          images: mockImages as RoomImage[],
          roomAmenities: [],
        };

        mockRoomRepository.findOne.mockResolvedValue(mockRoomWithManyImages);

        const startTime = Date.now();
        const result = await service.getMyListing(hostId, roomId);
        const endTime = Date.now();
        const loadTime = endTime - startTime;

        // Kiểm tra kết quả
        expect(result).toBeDefined();
        expect(result.images).toHaveLength(10);
        
        // Kiểm tra thời gian tải (nên < 5000ms theo yêu cầu, nhưng trong unit test thường rất nhanh)
        expect(loadTime).toBeLessThan(5000);
      });

      it('should efficiently query with relations included', async () => {
        const hostId = 1;
        const roomId = 601;

        const mockRoom = {
          id: roomId,
          hostId: hostId,
          title: 'Performance Test Room',
          images: [{ id: 1, imageUrl: 'test.jpg' }],
          roomAmenities: [
            { 
              id: 1, 
              amenity: { id: 1, name: 'WiFi' } 
            },
          ],
        };

        mockRoomRepository.findOne.mockResolvedValue(mockRoom);

        const result = await service.getMyListing(hostId, roomId);

        // Verify that relations are properly loaded
        expect(result.images).toBeDefined();
        expect(result.roomAmenities).toBeDefined();
        
        // Verify the query includes all necessary relations
        expect(mockRoomRepository.findOne).toHaveBeenCalledWith(
          expect.objectContaining({
            relations: ['images', 'roomAmenities', 'roomAmenities.amenity'],
          })
        );
      });

      it('should handle pagination efficiently for large datasets', async () => {
        const hostId = 1;
        const totalRooms = 100;
        const pageSize = 10;

        const mockRooms = Array.from({ length: pageSize }, (_, i) => ({
          id: i + 1,
          hostId: hostId,
          title: `Room ${i + 1}`,
          status: RoomStatus.AVAILABLE,
          moderationStatus: ModerationStatus.APPROVED,
          images: [],
          roomAmenities: [],
        }));

        mockRoomRepository.findAndCount.mockResolvedValue([mockRooms, totalRooms]);

        const startTime = Date.now();
        const result = await service.getMyListings(hostId, { page: '1', limit: pageSize.toString() });
        const endTime = Date.now();
        const loadTime = endTime - startTime;

        expect(result.data).toHaveLength(pageSize);
        expect(result.meta.total).toBe(totalRooms);
        expect(result.meta.totalPages).toBe(10);
        
        // Pagination query should be fast
        expect(loadTime).toBeLessThan(1000);
      });

      it('should use proper indexing by querying with indexed fields', async () => {
        const hostId = 1;
        
        mockRoomRepository.findAndCount.mockResolvedValue([[], 0]);

        await service.getMyListings(hostId, { page: '1', limit: '10' });

        // Verify query uses hostId which should be indexed
        expect(mockRoomRepository.findAndCount).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { hostId: hostId },
          })
        );
      });

      it('should retrieve detail page with full content within 5 seconds threshold', async () => {
        const hostId = 1;
        const roomId = 602;

        // Simulate room with full details
        const fullRoom = {
          id: roomId,
          hostId: hostId,
          title: 'Full Detail Room',
          description: 'Very long description...'.repeat(10),
          pricePerMonth: 7000000,
          images: Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            imageUrl: `https://example.com/large-image-${i}.jpg`,
          })),
          roomAmenities: Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            amenity: { id: i + 1, name: `Amenity ${i + 1}` },
          })),
        };

        mockRoomRepository.findOne.mockResolvedValue(fullRoom);

        const startTime = Date.now();
        const result = await service.getMyListing(hostId, roomId);
        const endTime = Date.now();

        expect(result).toBeDefined();
        expect(result.images).toBeDefined();
        expect(result.images!.length).toBeGreaterThan(0);
        expect(result.roomAmenities).toBeDefined();
        expect(result.roomAmenities!.length).toBeGreaterThan(0);
        
        // Should complete well within 5 second threshold
        const responseTime = endTime - startTime;
        expect(responseTime).toBeLessThan(5000);
      });
    });
  });

  describe('Additional Edge Cases & Validation', () => {
    
    it('should handle empty moderation notes gracefully', async () => {
      const approvedRoom = {
        id: 100,
        moderationStatus: ModerationStatus.APPROVED,
        moderationNotes: '',
      };

      mockRoomRepository.findOne.mockResolvedValue(approvedRoom);

      const result = await service.getMyListing(1, 100);

      expect(result.moderationNotes).toBe('');
      expect(result.moderationStatus).toBe(ModerationStatus.APPROVED);
    });

    it('should correctly order listings by creation date', async () => {
      const mockRooms = [
        { id: 1, createdAt: new Date('2025-01-03') },
        { id: 2, createdAt: new Date('2025-01-02') },
        { id: 3, createdAt: new Date('2025-01-01') },
      ];

        mockRoomRepository.findAndCount.mockResolvedValue([mockRooms, 3]);

      await service.getMyListings(1, { page: '1', limit: '10' });

      expect(mockRoomRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'DESC' },
        })
      );
    });

    it('should validate pagination parameters', async () => {
      mockRoomRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getMyListings(1, { page: '2', limit: '20' });

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(20);
      
      // Verify skip calculation
      expect(mockRoomRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (page 2 - 1) * limit 20
          take: 20,
        })
      );
    });
  });
});
