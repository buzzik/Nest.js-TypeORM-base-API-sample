import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// this is just wxample how to create many-to-many mannualy
@Entity('follows')
export class FollowEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  followerId: number;

  @Column()
  followingId: number;
}
