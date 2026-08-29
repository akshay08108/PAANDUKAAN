export type UserRole = "customer" | "seller";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  roles: UserRole[];
  storeName?: string;
};

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
  status: "published" | "out-of-stock" | "draft";
  preparationMinutes?: number;
};

export type CartLine = { product: Product; quantity: number };

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
  paymentMethod: "pay-at-shop" | "upi";
  stage: "Order placed" | "Confirmed" | "Preparing" | "Ready for pickup" | "Collected" | "Cancelled";
  placedAt: string;
};
