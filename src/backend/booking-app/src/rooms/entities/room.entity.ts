import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index, // ✅ Import Index
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

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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

@Entity({ name: 'rooms' })
@Index('idx_rooms_host_id', ['hostId']) // ✅ Index cho foreign key
@Index('idx_rooms_room_type_id', ['roomTypeId']) // ✅ Index cho foreign key
@Index('idx_rooms_status', ['status']) // ✅ Index cho filter status
@Index('idx_rooms_city', ['city']) // ✅ Index cho search theo city
@Index('idx_rooms_district', ['district']) // ✅ Index cho search theo district
@Index('idx_rooms_city_district', ['city', 'district']) // ✅ Composite index
@Index('idx_rooms_price', ['pricePerMonth']) // ✅ Index cho sort/filter price
@Index('idx_rooms_created_at', ['createdAt']) // ✅ Index cho sort by date
export class Room {
  @PrimaryGeneratedColumn({ name: 'room_id' })
  id: number;

  @Column({ name: 'host_id' })
  @Index() // ✅ Index riêng
  hostId: number;

  @Column({ name: 'room_type_id' })
  @Index() // ✅ Index riêng
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
  @Index() // ✅ Index cho search
  district: string;

  @Column({ type: 'varchar', length: 100 })
  @Index() // ✅ Index cho search
  city: string;

  @Column({ name: 'price_per_month', type: 'decimal', precision: 12, scale: 2 })
  @Index() // ✅ Index cho filter/sort price
  pricePerMonth: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 12, scale: 2 })
  depositAmount: number;

  @Column({ name: 'guest_capacity', type: 'smallint', default: 1 })
  guestCapacity: number;

  @Column({ name: 'alley_description', type: 'varchar', length: 255, nullable: true })
  alleyDescription: string;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
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
  @Index() // ✅ Index cho sort by date
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