import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index, 
} from 'typeorm';
import { RoomAmenity } from './room-amenity.entity';

@Entity({ name: 'amenities' })
@Index('idx_amenities_name', ['name']) 
export class Amenity {
  @PrimaryGeneratedColumn({ name: 'amenity_id' })
  id: number;

  @Column({
    name: 'amenity_name',
    type: 'varchar',
    length: 100,
    unique: true, 
    nullable: false,
  })
  @Index() 
  name: string;

  @OneToMany(() => RoomAmenity, (roomAmenity) => roomAmenity.amenity)
  roomAmenities: RoomAmenity[];
}