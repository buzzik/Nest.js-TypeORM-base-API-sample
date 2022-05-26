import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional({ always: true })
  @IsNotEmpty()
  readonly title: string;

  @IsOptional({ always: true })
  @IsNotEmpty()
  readonly description: string;

  @IsOptional({ always: true })
  @IsNotEmpty()
  readonly body: string;
}
