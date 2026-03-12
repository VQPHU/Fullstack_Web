export interface User {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    role: "admin" | "user" | "deliveryman";
    createdAt: string;
};

export type Brand = {
    _id: string;
    name: string;
    image?: string; // Image is optional 
    createdAt: string;
};

export type Category = {
    _id: string;
    name: string;
    image?: string;
    categoryType: "Featured" | "Hot Categories" | "Top Categories";
    createdAt: string;
};