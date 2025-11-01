import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { RoomAmenity } from '../../rooms/entities/room-amenity.entity';

@Entity({ name: 'amenities' })
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
  name: string;


  @OneToMany(() => RoomAmenity, (roomAmenity) => roomAmenity.amenity)
  roomAmenities: RoomAmenity[];
}