import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/user/decorators/user.decorator';
import { ProfileService } from './profile.service';
import { ProfileResponseInterface } from './types/profile-response.interface';
import { ProfileType } from './types/profile.type';

@Controller('profiles')
export class ProfileController {
  constructor(public profileService: ProfileService) {}

  @Get(':username')
  async findOne(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile: ProfileType = await this.profileService.findByUsername(
      username,
      currentUserId,
    );
    return this.profileService.buildArticleResponse(profile);
  }

  @Post(':username/follow')
  @UseGuards(AuthGuard)
  async followProfile(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile: ProfileType = await this.profileService.followProfile(
      username,
      currentUserId,
    );
    return this.profileService.buildArticleResponse(profile);
  }

  @Delete(':username/follow')
  @UseGuards(AuthGuard)
  async unfollowProfile(
    @User('id') currentUserId: number,
    @Param('username') username: string,
  ): Promise<ProfileResponseInterface> {
    const profile: ProfileType = await this.profileService.unfollowProfile(
      username,
      currentUserId,
    );
    return this.profileService.buildArticleResponse(profile);
  }
}
