export type User = {
    id: number;
    name: string;
    surname: string;
    username: string;
    email: string;
    bio: string;
    photo: string;
};

export type CreateAccountProps = {
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
};