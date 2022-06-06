import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { FollowEntity } from './follow.entity';
import { ProfileResponseInterface } from './types/profile-response.interface';
import { ProfileType } from './types/profile.type';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}
  buildArticleResponse(profile: ProfileType): ProfileResponseInterface {
    delete profile.email;
    return { profile };
  }
  async findByUsername(
    username: string,
    currentUserId: number,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ username });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const following = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });
    const profile = {
      ...user,
      following: Boolean(following),
    };
    return profile;
  }

  async followProfile(
    username: string,
    currentUserId: number,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ username });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (currentUserId === user.id) {
      throw new HttpException('Same user ID', HttpStatus.BAD_REQUEST);
    }
    const follow = await this.followRepository.findOne({
      followerId: currentUserId,
      followingId: user.id,
    });

    if (!follow) {
      const followNew = new FollowEntity();
      followNew.followerId = currentUserId;
      followNew.followingId = user.id;

      await this.followRepository.save(followNew);
    }
    const profile = {
      ...user,
      following: true,
    };
    return profile;
  }

  async unfollowProfile(
    username: string,
    currentUserId: number,
  ): Promise<ProfileType> {
    const user = await this.userRepository.findOne({ username });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (currentUserId === user.id) {
      throw new HttpException('Same user ID', HttpStatus.BAD_REQUEST);
    }
    await this.followRepository.delete({
      followerId: currentUserId,
      followingId: user.id,
    });

    const profile = {
      ...user,
      following: false,
    };
    return profile;
  }
}
