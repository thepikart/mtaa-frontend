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

export type EventCardProps = {
    id: number,
    title: string,
    place: string,
    date: string,
    description: string,
    photo: string
};

export type BankAccountProps = {
    address: string;
    city: string;
    zip: string;
    country: string;
    number: string;
}