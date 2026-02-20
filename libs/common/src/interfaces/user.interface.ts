export interface IUser {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

// Pick is used here to avoid redeclaring of types id and email

export interface IUserAuth extends Pick<IUser, 'id' | 'email'> {
    roles: string[];
}