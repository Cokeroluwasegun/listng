import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5000 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  isNegotiable: z.boolean().default(false),
  condition: z.enum(["NEW", "USED", "REFURBISHED"]),
  images: z
    .array(z.string().url())
    .min(1, "Add at least one image")
    .max(10, "Maximum 10 images allowed"),
  categoryId: z.string().min(1, "Category is required"),
  marketId: z.string().min(1).optional(),
  isUrgent: z.boolean().default(false),
  attributes: z.record(z.string(), z.unknown()).optional(),
});

export type CreateListingInput = z.infer<typeof listingSchema>;

export const conversationSchema = z.object({
  participantId: z.string().min(1),
  listingId: z.string().min(1).optional(),
  initialMessage: z.string().min(1).max(1000).optional(),
});

export type CreateConversationInput = z.infer<typeof conversationSchema>;

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

export type SendMessageInput = z.infer<typeof messageSchema>;

export const individualRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s-]{10,15}$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export type IndividualRegistrationInput = z.infer<typeof individualRegistrationSchema>;

export const vendorRegistrationSchema = individualRegistrationSchema.extend({
  businessName: z.string().min(2, "Business name is required"),
  cacNumber: z.string().min(6, "CAC number is required"),
  cacDocument: z.string().url().optional(),
  marketId: z.string().optional(),
});

export type VendorRegistrationInput = z.infer<typeof vendorRegistrationSchema>;

export const reportSchema = z.object({
  listingId: z.string().min(1),
  reason: z.enum(["SPAM", "FRAUD", "COUNTERFEIT", "PROHIBITED", "OTHER"]),
  details: z.string().max(1000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
