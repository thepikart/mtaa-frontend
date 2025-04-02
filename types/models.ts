export type User = {
    id: number;
    name: string;
    surname: string;
    username: string;
    email: string;
    bio: string | null;
    photo: string | null;
};

export type CreateAccountProps = {
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
};