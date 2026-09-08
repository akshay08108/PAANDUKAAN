export type UserRole = "customer" | "seller";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  roles: UserRole[];
  storeName?: string;
};

export type StoreProfile = {
  id: string;
  ownerId: string;
  name: string;
  imageUrl?: string;
  description?: string;
  address?: string;
  area?: string;
  city: string;
  openingTime?: string;
  closingTime?: string;
  isOpen: boolean;
  contactNumber?: string;
  upiId?: string;
  upiQrImageUrl?: string;
};

export type ProductStatus = "published" | "out-of-stock" | "draft";

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
  storeId: string;
  storeName: string;
  status: ProductStatus;
  preparationMinutes?: number;
};

export type CartLine = { product: Product; quantity: number };

export type PaymentMethod = "pay-at-shop" | "upi";
export type PaymentStatus = "PENDING" | "PAID" | "PAY_AT_PICKUP" | "FAILED" | "REFUNDED";
export type OrderStage = "Order placed" | "Confirmed" | "Preparing" | "Ready for pickup" | "Collected" | "Cancelled" | "Rejected";

export type PickupOrder = {
  id: string;
  customerId: string;
  customerName: string;
  items: CartLine[];
  total: number;
  storeId: string;
  storeName: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  customerMobile?: string;
  stage: OrderStage;
  placedAt: string;
};

export type ProductInput = Omit<Product, "id" | "storeId" | "storeName" | "status">;
export type StoreInput = Omit<StoreProfile, "id" | "ownerId">;

export type SupportTicket = {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  storeId: string;
  issue: string;
  message: string;
  status: "Open" | "Resolved";
  sellerReply?: string;
  createdAt: string;
};

export type StoreReview = {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  storeId: string;
  stars: number;
  comment: string;
  createdAt: string;
};

export type OrderAlert = {
  audience: UserRole;
  title: string;
  body: string;
  orderId: string;
};
