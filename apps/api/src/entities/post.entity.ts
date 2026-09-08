import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from "typeorm";
import { UserEntity } from "./user.entity.js";

@Entity("posts")
export class PostEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar" })
  text!: string;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  @JoinColumn({ name: "userId" })
  user!: Relation<UserEntity>;

  @Column({ type: "integer" })
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
