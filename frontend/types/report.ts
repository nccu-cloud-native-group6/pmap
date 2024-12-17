import { User } from "next-auth";
import { Location } from "./location";


export interface Report {
    user: User;
    rainDegree: number;
    photoUrl?: string;
    comment?: string;
    location: Location;
    createdAt: Date;
}