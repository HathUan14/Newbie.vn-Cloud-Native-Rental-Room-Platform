import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Room } from '../room/entities/room.entity';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true, // Cho phép null khi đăng nhập bằng Google
    select: false,
  })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: false })
  fullName: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  phoneNumber: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl: string;

  @Column({
    name: 'auth_provider',
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    nullable: false,
  })
  authProvider: AuthProvider;

  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  googleId: string;

  @Column({ name: 'is_host', type: 'boolean', default: false, nullable: false })
  isHost: boolean;

  @Column({ name: 'is_admin', type: 'boolean', default: false, nullable: false })
  isAdmin: boolean;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false, // chờ xác thực email sẽ set true
    nullable: false,
  })
  isActive: boolean;

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

  @OneToMany(() => Room, (room) => room.host)
  rooms: Room[];
}