"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut as firebaseSignOut, updateProfile } from "firebase/auth";
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";
import type { AppUser, CartLine, PickupOrder, Product, UserRole } from "@/lib/types";

type RegisterInput = { name: string; email: string; mobile: string; password: string; role: UserRole; storeName?: string };
type PlaceOrderInput = Pick<PickupOrder, "pickupDate" | "pickupTime" | "paymentMethod">;
type AppContextValue = {
  user: AppUser | null;
  authReady: boolean;
  products: Product[];
  catalogReady: boolean;
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  orders: PickupOrder[];
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  addToCart: (product: Product) => string | null;
  setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  placeOrder: (input: PlaceOrderInput) => Promise<string>;
  publishProduct: (product: Omit<Product, "id" | "storeId" | "storeName" | "status">) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const CART_KEY = "paandukaan-cart-v1";

function parseUser(id: string, email: string, data: Record<string, unknown>): AppUser {
  const roles: UserRole[] = Array.isArray(data.roles) ? data.roles.filter((role): role is UserRole => role === "customer" || role === "seller") : ["customer"];
  return { id, email, name: String(data.name ?? email.split("@")[0]), mobile: String(data.mobile ?? ""), roles, storeName: data.storeName ? String(data.storeName) : undefined };
}

function parseProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: String(data.name ?? "Untitled item"),
    description: String(data.description ?? ""),
    category: String(data.category ?? "Paan"),
    price: Number(data.price ?? 0),
    stock: Number(data.stock ?? 0),
    imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
    storeId: String(data.storeId ?? ""),
    storeName: String(data.storeName ?? "Local shop"),
    status: data.status === "out-of-stock" || data.status === "draft" ? data.status : "published",
    preparationMinutes: Number(data.preparationMinutes ?? 15),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<PickupOrder[]>([]);

  useEffect(() => {
    queueMicrotask(() => {
      try { setCart(JSON.parse(localStorage.getItem(CART_KEY) ?? "[]")); } catch { setCart([]); }
    });
  }, []);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);

  useEffect(() => onSnapshot(collection(firestore, "paanProducts"), (snapshot) => {
    setProducts(snapshot.docs.map((item) => parseProduct(item.id, item.data())).filter((item) => item.status === "published" && item.stock > 0));
    setCatalogReady(true);
  }, () => setCatalogReady(true)), []);

  useEffect(() => {
    let stopProfile = () => {};
    const stopAuth = onAuthStateChanged(firebaseAuth, (authUser) => {
      stopProfile();
      if (!authUser) { setUser(null); setAuthReady(true); return; }
      stopProfile = onSnapshot(doc(firestore, "users", authUser.uid), (snapshot) => {
        setUser(parseUser(authUser.uid, authUser.email ?? "", snapshot.data() ?? { name: authUser.displayName }));
        setAuthReady(true);
      }, () => setAuthReady(true));
    }, () => setAuthReady(true));
    return () => { stopProfile(); stopAuth(); };
  }, []);

  useEffect(() => {
    if (!user?.id) { queueMicrotask(() => setOrders([])); return; }
    const ordersQuery = query(collection(firestore, "paanOrders"), where("customerId", "==", user.id));
    return onSnapshot(ordersQuery, (snapshot) => setOrders(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as PickupOrder)).sort((a, b) => b.placedAt.localeCompare(a.placedAt))), () => setOrders([]));
  }, [user?.id]);

  const signIn = useCallback(async (email: string, password: string) => { await signInWithEmailAndPassword(firebaseAuth, email.trim(), password); }, []);
  const register = useCallback(async (input: RegisterInput) => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, input.email.trim(), input.password);
    try {
      await updateProfile(credential.user, { displayName: input.name.trim() });
      await setDoc(doc(firestore, "users", credential.user.uid), {
        name: input.name.trim(), email: input.email.trim(), mobile: input.mobile.trim(), roles: [input.role], activeRole: input.role,
        ...(input.role === "seller" ? { sellerStatus: "approved", storeIds: [`paan-store-${credential.user.uid}`], storeName: input.storeName?.trim() } : {}),
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      });
    } catch (error) {
      await deleteUser(credential.user).catch(() => undefined);
      throw error;
    }
  }, []);
  const resetPassword = useCallback(async (email: string) => { await sendPasswordResetEmail(firebaseAuth, email.trim()); }, []);
  const signOut = useCallback(async () => { await firebaseSignOut(firebaseAuth); }, []);
  const addToCart = useCallback((product: Product) => {
    if (cart.length && cart[0].product.storeId !== product.storeId) return "Please complete or clear your current shop order first.";
    setCart((current) => {
      const found = current.find((line) => line.product.id === product.id);
      return found ? current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) } : line) : [...current, { product, quantity: 1 }];
    });
    return null;
  }, [cart]);
  const setQuantity = useCallback((id: string, quantity: number) => setCart((current) => current.map((line) => line.product.id === id ? { ...line, quantity: Math.max(1, Math.min(quantity, line.product.stock)) } : line)), []);
  const removeFromCart = useCallback((id: string) => setCart((current) => current.filter((line) => line.product.id !== id)), []);
  const placeOrder = useCallback(async (input: PlaceOrderInput) => {
    if (!user) throw new Error("Sign in to place your pickup order.");
    if (!cart.length) throw new Error("Your cart is empty.");
    const store = cart[0].product;
    const payload = {
      customerId: user.id,
      customerName: user.name,
      items: cart,
      total: cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
      storeId: store.storeId,
      storeName: store.storeName,
      pickupDate: input.pickupDate,
      pickupTime: input.pickupTime,
      paymentMethod: input.paymentMethod,
      fulfilment: "pickup",
      stage: "Order placed",
      placedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    };
    const orderDoc = await addDoc(collection(firestore, "paanOrders"), payload);
    setCart([]);
    return orderDoc.id;
  }, [cart, user]);
  const publishProduct = useCallback(async (product: Omit<Product, "id" | "storeId" | "storeName" | "status">) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    await addDoc(collection(firestore, "paanProducts"), { ...product, storeId: user.id, storeName: user.storeName ?? user.name, status: "published", createdAt: serverTimestamp() });
  }, [user]);

  const value = useMemo<AppContextValue>(() => ({
    user, authReady, products, catalogReady, cart, orders,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    cartTotal: cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    signIn, register, resetPassword, signOut, addToCart, setQuantity, removeFromCart, placeOrder, publishProduct,
  }), [user, authReady, products, catalogReady, cart, orders, signIn, register, resetPassword, signOut, addToCart, setQuantity, removeFromCart, placeOrder, publishProduct]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
