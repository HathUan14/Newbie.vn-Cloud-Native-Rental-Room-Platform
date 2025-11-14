import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index, 
} from 'typeorm';
import { User } from '../../users/user.entity';
import { RoomType } from './room-type.entity';
import { RoomImage } from './room-image.entity';
import { RoomAmenity } from './room-amenity.entity';

export enum RoomStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  PENDING = 'pending',
}

export enum ParkingType {
  FREE = 'free',
  PAID = 'paid',
  NONE = 'none',
}

export enum BathroomType {
  PRIVATE = 'private',
  SHARED = 'shared',
}

export enum ModerationStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_EDIT = 'needs_edit',
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
}

@Entity({ name: 'rooms' })
@Index('idx_rooms_host_id', ['hostId']) 
@Index('idx_rooms_room_type_id', ['roomTypeId']) 
@Index('idx_rooms_city', ['city']) 
@Index('idx_rooms_district', ['district']) 
@Index('idx_rooms_city_district', ['city', 'district']) 
@Index('idx_rooms_price', ['pricePerMonth']) 
@Index('idx_rooms_created_at', ['createdAt']) 
export class Room {
  @PrimaryGeneratedColumn({ name: 'room_id' })
  id: number;

  @Column({ name: 'host_id' })
  @Index() 
  hostId: number;

  @Column({ name: 'room_type_id' })
  @Index() 
  roomTypeId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float', nullable: false })
  area_sqm: number;

  @Column({ name: 'address_street', type: 'varchar', length: 255 })
  addressStreet: string;

  @Column({ type: 'varchar', length: 100 })
  ward: string;

  @Column({ type: 'varchar', length: 100 })
  @Index() 
  district: string;

  @Column({ type: 'varchar', length: 100 })
  @Index() 
  city: string;

  @Column({ name: 'price_per_month', type: 'decimal', precision: 12, scale: 2 })
  @Index() 
  pricePerMonth: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 12, scale: 2 })
  depositAmount: number;

  @Column({ name: 'guest_capacity', type: 'smallint', default: 1 })
  guestCapacity: number;

  @Column({ name: 'alley_description', type: 'varchar', length: 255, nullable: true })
  alleyDescription: string;

  // status
@Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.AVAILABLE,
    name: 'availability_status', //  Cột cho Host/Hệ thống
  })
  @Index() 
  availabilityStatus: AvailabilityStatus;

  @Column({
    type: 'enum',
    enum: ModerationStatus,
    default: ModerationStatus.DRAFT,
    name: 'moderation_status', // Cột riêng cho Admin
  })
  @Index() 
  status: RoomStatus;

  @Column({
  type: 'enum',
  enum: ModerationStatus,
  default: ModerationStatus.PENDING
  })
  @Index() 
  moderationStatus: ModerationStatus;

  @Column({ name: 'ai_location_rating', type: 'float', nullable: true })
  aiLocationRating: number;

  @Column({ name: 'ai_location_notes', type: 'text', nullable: true })
  aiLocationNotes: string;

  @Column({
    name: 'ai_fire_risk_level',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  aiFireRiskLevel: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @Index() 
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host: User;

  @ManyToOne(() => RoomType, (roomType) => roomType.rooms, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'room_type_id' })
  roomType: RoomType;

  @OneToMany(() => RoomImage, (image) => image.room)
  images: RoomImage[];

  @OneToMany(() => RoomAmenity, (roomAmenity) => roomAmenity.room)
  roomAmenities: RoomAmenity[];
}