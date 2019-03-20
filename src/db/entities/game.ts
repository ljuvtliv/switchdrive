import {Entity,Column,PrimaryGeneratedColumn,CreateDateColumn, ManyToOne} from "typeorm";
import {Title} from './title';
@Entity()
export class Game {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    titleid:string; //full titleid as on switch

    @Column()
    version:string;

    @Column()
    name:string;

    @ManyToOne(type => Title, title => title.owned)
    title: Title;

    @Column()
    location: string;
}
