import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Please enter valid email address" }),
    password: z
        .string().min(1, { message: "you have to enter a password" }),

});

export const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be least 2 characters" }),
    email: z.string().email({ message: "Please enter valid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["admin", "user", "deliveryman"], {
        message: "Please select a valid role",
    }),
});

export const userSchema = z.object({
    name: z.string().min(2, { message: "Name must be least 2 characters" }),
    email: z.string().email({ message: "Please enter valid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .optional(),
    role: z.enum(["admin", "user", "deliveryman"], {
        message: "Please select a valid role",
    }),
    avatar: z.string().optional(),
});

export const brandSchema = z.object({
    name: z.string().min(2, { message: "name" }),
    image: z.string().optional()
})

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    image: z.string().optional(),
    categoryType: z.enum(["Featured", "Hot Categories", "Top Categories"], {
        message: "Please select a valid role",
    }),
});

export const productSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    description: z
        .string()
        .min(10, { message: "Description must be  at least 10 characters" }),
    price: z.number().min(0, { message: "Price must be a positive number" }),
    discountPercentage: z.number().min(0).max(100),
    stock: z.number().min(0),
    category: z.string().min(1, { message: "Pleace select a category" }),
    brand: z.string().min(1, { message: "Pleace select a brand" }),
    image: z.string().min(1, { message: "Pleace select an image" }), 
});