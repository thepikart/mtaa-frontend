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

export type MyEventCardProps = {
    id: number,
    title: string,
    place: string,
    date: string,
    description: string,
    photo: string,
    creator: boolean,
}

export type BankAccountProps = {
    address: string;
    city: string;
    zip: string;
    country: string;
    number: string;
};

export type Notifications = {
    my_attendees: boolean;
    my_comments: boolean;
    my_time: boolean;
    reg_attendees: boolean;
    reg_comments: boolean;
    reg_time: boolean;
};