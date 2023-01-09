import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Product } from '../../products/entities/product.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
    unique: true
  })
  email: string;

  @Column('text')
  fullName: string;

  @Column('text', {
    select: false
  })
  password: string;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @Column('bool', {
    nullable: true,
    default: true
  })
  isActive: boolean;

  @OneToMany(
    () => Product, 
    product => product.user
  )
  products: Product[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  emailToLowerCaseUpdate() {
    this.email = this.email.toLowerCase().trim();
  }
}
