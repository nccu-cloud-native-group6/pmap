import { AppUser } from "./user";
import { Location } from "./location";


export interface Report {
    user: AppUser;
    rainDegree: number;
    photoUrl?: string;
    comment?: string;
    location: Location;
    createdAt: Date;
}