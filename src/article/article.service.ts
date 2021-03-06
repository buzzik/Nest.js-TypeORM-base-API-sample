import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseInterface } from './types/article-response.interface';
import slugify from 'slugify';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticlesResponseInterface } from './types/articles-response.interface';
import { FollowEntity } from 'src/profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');
    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }
    if (query.favorited) {
      // const user = await this.userRepository.findOneBy(
      //   {
      //     username: query.favorited,
      //   },
      //   { relations: ['favorites'] },
      // );
      const [user] = await this.userRepository.find({
        where: { username: query.favorited },
        relations: { favorites: true },
      });
      const ids = user.favorites.map((el) => el.id);
      // queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      queryBuilder.andWhereInIds(ids);
      console.log(user);
    }
    if (query.author) {
      const author: UserEntity = await this.userRepository.findOneBy({
        username: query.author,
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];
    if (currentUserId) {
      const [currentUser] = await this.userRepository.find({
        where: { id: currentUserId },
        relations: { favorites: true },
      });
      favoriteIds = currentUser.favorites.map((article) => article.id);
    }
    const articles = await queryBuilder.getMany();

    const articleWithFavorites = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });
    // const articles = await this.articleRepository.find({
    //   where: { author: { id: currentUserId } },
    //   relations: ['author'],
    //   order: { createdAt: 'DESC' },
    //   skip: query.offset,
    //   take: query.limit,
    // });
    // const articlesCount = await this.articleRepository.count({
    //   where: { author: { id: currentUserId } },
    // });
    return { articles: articleWithFavorites, articlesCount };
  }

  async getArticlesFeed(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const following = await this.followRepository.find({
      where: { followerId: currentUserId },
    });
    if (!following.length) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = following.map((el) => el.followingId);

    const queryBuilder = this.articleRepository
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');
    queryBuilder.orderBy('articles.createdAt', 'DESC');

    queryBuilder.where('articles.author in (:...ids)', {
      ids: followingUserIds,
    });

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }
    const articlesCount: number = await queryBuilder.getCount();
    const articles: ArticleEntity[] = await queryBuilder.getMany();

    return { articles, articlesCount };
  }
  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(article.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string) {
    const rnd = Math.floor((Math.random() * Math.pow(36, 6)) | 0).toString(36);
    const result = `${slugify(title, { lower: true })}-${rnd}`;
    return result;
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ where: { slug } });
  }

  async deleteArticle(
    currentUserId: number,
    slug: string,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    return await this.articleRepository.delete(article.id);
  }

  async update(
    currentUserId: number,
    slug: string,
    updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }

    Object.assign(article, updateArticleDto);
    // article.slug = this.getSlug(article.title);
    return await this.articleRepository.save(article);
  }

  async addArticleToFavorite(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    const isNotFavorited =
      user.favorites.findIndex((favorite) => favorite.id === article.id) === -1;
    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }

  async removeArticleFromFavorite(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });
    const articleIndex = user.favorites.findIndex(
      (favorite) => favorite.id === article.id,
    );
    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }
    return article;
  }
}
