import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { RoomType } from './room-type.entity';
import { RoomImage } from './room-image.entity';
import { RoomAmenity } from './room-amenity.entity';

export enum RoomStatus {
  AVAILABLE = 'available', // Còn trống
  RENTED = 'rented',     // Đã thuê
  PENDING = 'pending',     // Đang chờ duyệt
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
export class Room {
  @PrimaryGeneratedColumn({ name: 'room_id' })
  id: number;

  @Column({ name: 'host_id' }) 
  hostId: number;

  @Column({ name: 'room_type_id' }) 
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
  district: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'price_per_month', type: 'decimal', precision: 12, scale: 2 })
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
  status: RoomStatus;

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