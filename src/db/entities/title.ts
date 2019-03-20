import {Entity,Column,PrimaryGeneratedColumn,CreateDateColumn, OneToMany} from "typeorm";
import { Game } from "./game";
@Entity()
export class Title {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nshopid:string; //id on eshop

    @Column()
    titleid:string; //full titleid as on switch
    //This is the parent titleid

    @Column()
    name:string;

    @Column({nullable:true})
    intro:string;
    @Column("text",{nullable:true})
    description:string;

    @Column("text",{nullable:true,array: true})
    category: string[];
    @Column("text",{array: true,nullable:true})
    ratingContent: string[];
    @Column("text",{array: true,nullable:true})
    languages: string[];
    @Column({nullable:true})
    rating:number;
    @Column({nullable:true})
    numberOfPlayers: number;
    @Column()
    isDemo:'boolean';
    @Column({type:"bigint",nullable:true})
    size: number;

    @Column({type:'date',nullable:true})
    releaseDate:Date;

    @Column({default:'',nullable: true})
    region: string;
    @Column({default:'',nullable: true})
    key: string;
    @Column({default:'',nullable: true})
    version: string;
    @Column({default:'',nullable: true})
    rightsid: string;

    @Column({nullable:true})
    developer:string;

    @Column({nullable:true})
    publisher:string;

    @Column("text",{array: true})
    screenshots: string[];

    @OneToMany(type => Game, game => game.title)
    owned: Game[]
}
