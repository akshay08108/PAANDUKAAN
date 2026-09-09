"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebaseAuth, firestore } from "@/lib/firebase";
import type {
  AppUser,
  CartLine,
  OrderStage,
  OrderAlert,
  PaymentStatus,
  PickupOrder,
  Product,
  ProductInput,
  StoreInput,
  StoreProfile,
  StoreReview,
  SupportTicket,
  UserRole,
} from "@/lib/types";

type RegisterInput = { name: string; email: string; mobile: string; password: string; role: UserRole; storeName?: string };
type PlaceOrderInput = Pick<PickupOrder, "pickupDate" | "pickupTime" | "paymentMethod">;
type AppContextValue = {
  user: AppUser | null;
  authReady: boolean;
  products: Product[];
  sellerProducts: Product[];
  stores: StoreProfile[];
  catalogReady: boolean;
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  orders: PickupOrder[];
  tickets: SupportTicket[];
  reviews: StoreReview[];
  alertsEnabled: boolean;
  activeAlert: OrderAlert | null;
  signIn: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  addToCart: (product: Product) => string | null;
  setQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  placeOrder: (input: PlaceOrderInput) => Promise<string>;
  publishProduct: (product: ProductInput) => Promise<void>;
  updateProduct: (id: string, product: ProductInput) => Promise<void>;
  deactivateProduct: (id: string) => Promise<void>;
  saveStore: (store: StoreInput) => Promise<void>;
  updateOrderStage: (id: string, stage: OrderStage) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  enableAlerts: () => void;
  dismissAlert: () => void;
  createTicket: (order: PickupOrder, issue: string, message: string) => Promise<void>;
  resolveTicket: (id: string, sellerReply: string) => Promise<void>;
  createReview: (order: PickupOrder, stars: number, comment: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const CART_KEY = "paandukaan-cart-v1";
const AUTH_PROFILE_CACHE_KEY = "merapaan-firebase-profile-v1";

function omitUndefined<T extends object>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined));
}

function playAlert(context: AudioContext) {
  if (context.state !== "running") return;
  const start = context.currentTime;
  [660, 880, 660].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const at = start + index * 0.22;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.12, at + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.2);
  });
}

function parseUser(id: string, email: string, data: Record<string, unknown>): AppUser {
  const roles: UserRole[] = Array.isArray(data.roles)
    ? data.roles.filter((role): role is UserRole => role === "customer" || role === "seller")
    : ["customer"];
  return {
    id,
    email,
    name: String(data.name ?? email.split("@")[0]),
    mobile: String(data.mobile ?? ""),
    roles,
    storeName: data.storeName ? String(data.storeName) : undefined,
  };
}

function readCachedUser(id: string, email: string) {
  try {
    const cached = localStorage.getItem(AUTH_PROFILE_CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as Record<string, unknown>;
    if (data.id !== id) return null;
    return parseUser(id, email, data);
  } catch {
    return null;
  }
}

function cacheUser(profile: AppUser | null) {
  if (profile) localStorage.setItem(AUTH_PROFILE_CACHE_KEY, JSON.stringify(profile));
  else localStorage.removeItem(AUTH_PROFILE_CACHE_KEY);
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

function parseStore(id: string, data: Record<string, unknown>): StoreProfile {
  return {
    id,
    ownerId: String(data.ownerId ?? id),
    name: String(data.name ?? "Local paan shop"),
    imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
    description: data.description ? String(data.description) : undefined,
    address: data.address ? String(data.address) : undefined,
    area: data.area ? String(data.area) : undefined,
    city: String(data.city ?? "Hyderabad"),
    openingTime: data.openingTime ? String(data.openingTime) : undefined,
    closingTime: data.closingTime ? String(data.closingTime) : undefined,
    isOpen: data.isOpen !== false,
    contactNumber: data.contactNumber ? String(data.contactNumber) : undefined,
    upiId: data.upiId ? String(data.upiId) : undefined,
    upiQrImageUrl: data.upiQrImageUrl ? String(data.upiQrImageUrl) : undefined,
  };
}

function parseOrder(id: string, data: Record<string, unknown>): PickupOrder {
  const method = data.paymentMethod === "upi" ? "upi" : "pay-at-shop";
  const legacyStage = String(data.stage ?? "Order placed") as OrderStage;
  return {
    id,
    customerId: String(data.customerId ?? ""),
    customerName: String(data.customerName ?? "Customer"),
    customerMobile: data.customerMobile ? String(data.customerMobile) : undefined,
    items: Array.isArray(data.items) ? data.items as CartLine[] : [],
    total: Number(data.total ?? 0),
    storeId: String(data.storeId ?? ""),
    storeName: String(data.storeName ?? "Local shop"),
    pickupDate: String(data.pickupDate ?? ""),
    pickupTime: String(data.pickupTime ?? ""),
    paymentMethod: method,
    paymentStatus: (data.paymentStatus as PaymentStatus | undefined) ?? (method === "upi" ? "PENDING" : "PAY_AT_PICKUP"),
    paymentReference: data.paymentReference ? String(data.paymentReference) : undefined,
    stage: legacyStage,
    placedAt: String(data.placedAt ?? ""),
  };
}

function parseTicket(id: string, data: Record<string, unknown>): SupportTicket {
  return {
    id,
    orderId: String(data.orderId ?? ""),
    customerId: String(data.customerId ?? ""),
    customerName: String(data.customerName ?? "Customer"),
    storeId: String(data.storeId ?? ""),
    issue: String(data.issue ?? "Order support"),
    message: String(data.message ?? ""),
    status: data.status === "Resolved" ? "Resolved" : "Open",
    sellerReply: data.sellerReply ? String(data.sellerReply) : undefined,
    createdAt: String(data.createdAtText ?? ""),
  };
}

function parseReview(id: string, data: Record<string, unknown>): StoreReview {
  return {
    id,
    orderId: String(data.orderId ?? ""),
    customerId: String(data.customerId ?? ""),
    customerName: String(data.customerName ?? "Customer"),
    storeId: String(data.storeId ?? ""),
    stars: Math.max(1, Math.min(5, Number(data.stars ?? 5))),
    comment: String(data.comment ?? ""),
    createdAt: String(data.createdAtText ?? ""),
  };
}

export function friendlyAuthError(reason: unknown) {
  const message = reason instanceof Error ? reason.message : "";
  if (message.includes("auth/invalid-credential")) return "Email or password is incorrect.";
  if (message.includes("auth/email-already-in-use")) return "An account already exists with this email.";
  if (message.includes("auth/invalid-email")) return "Enter a valid email address.";
  if (message.includes("auth/weak-password")) return "Use a password with at least 6 characters.";
  if (message.includes("auth/too-many-requests")) return "Too many attempts. Please wait and try again.";
  if (message.includes("auth/network-request-failed")) return "Check your internet connection and try again.";
  if (message.startsWith("This email is not registered") || message.startsWith("Account profile not found")) return message;
  return "We could not complete that request. Please try again.";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [catalogReady, setCatalogReady] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [activeAlert, setActiveAlert] = useState<OrderAlert | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const alertsEnabledRef = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
        setCart(Array.isArray(saved) ? saved : []);
      } catch {
        setCart([]);
      }
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const stopProducts = onSnapshot(collection(firestore, "paanProducts"), (snapshot) => {
      setAllProducts(snapshot.docs.map((item) => parseProduct(item.id, item.data())));
      setCatalogReady(true);
    }, () => setCatalogReady(true));
    const stopStores = onSnapshot(collection(firestore, "paanStores"), (snapshot) => {
      setStores(snapshot.docs.map((item) => parseStore(item.id, item.data())));
    });
    return () => {
      stopProducts();
      stopStores();
    };
  }, []);

  useEffect(() => {
    let stopProfile = () => {};
    const stopAuth = onAuthStateChanged(firebaseAuth, (authUser) => {
      stopProfile();
      if (!authUser) {
        setUser(null);
        cacheUser(null);
        setAuthReady(true);
        return;
      }
      const cachedUser = readCachedUser(authUser.uid, authUser.email ?? "");
      if (cachedUser) {
        setUser(cachedUser);
        setAuthReady(true);
      } else {
        setAuthReady(false);
      }
      stopProfile = onSnapshot(doc(firestore, "users", authUser.uid), (snapshot) => {
        const profile = snapshot.exists()
          ? parseUser(authUser.uid, authUser.email ?? "", snapshot.data())
          : null;
        setUser(profile);
        cacheUser(profile);
        setAuthReady(true);
      }, () => {
        if (!cachedUser) setUser(null);
        setAuthReady(true);
      });
    }, () => {
      setUser(null);
      setAuthReady(true);
    });
    return () => {
      stopProfile();
      stopAuth();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      queueMicrotask(() => setOrders([]));
      return;
    }
    const seller = user.roles.includes("seller");
    const field = seller ? "storeId" : "customerId";
    let initialized = false;
    const previousStages = new Map<string, OrderStage>();
    const ordersQuery = query(collection(firestore, "paanOrders"), where(field, "==", user.id));
    return onSnapshot(ordersQuery, (snapshot) => {
      const nextOrders = snapshot.docs.map((item) => parseOrder(item.id, item.data())).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
      setOrders(nextOrders);
      if (initialized) {
        const changed = snapshot.docChanges().find((change) => {
          const order = parseOrder(change.doc.id, change.doc.data());
          if (seller) return change.type === "added" && order.stage === "Order placed";
          return change.type === "modified" && previousStages.get(order.id) !== "Confirmed" && order.stage === "Confirmed";
        });
        if (changed) {
          const order = parseOrder(changed.doc.id, changed.doc.data());
          setActiveAlert({ audience: seller ? "seller" : "customer", title: seller ? "New pickup order" : "Order accepted", body: seller ? `${order.customerName} · pickup at ${order.pickupTime}` : `${order.storeName} accepted your pickup order.`, orderId: order.id });
          if (alertsEnabledRef.current && audioRef.current) void audioRef.current.resume().then(() => playAlert(audioRef.current!)).catch(() => undefined);
        }
      }
      previousStages.clear();
      nextOrders.forEach((order) => previousStages.set(order.id, order.stage));
      initialized = true;
    }, () => setOrders([]));
  }, [user?.id, user?.roles]);

  useEffect(() => {
    if (!user?.id) {
      queueMicrotask(() => { setTickets([]); setReviews([]); });
      return;
    }
    const seller = user.roles.includes("seller");
    const field = seller ? "storeId" : "customerId";
    const ticketQuery = query(collection(firestore, "paanTickets"), where(field, "==", user.id));
    const reviewQuery = query(collection(firestore, "paanReviews"), where(field, "==", user.id));
    const stopTickets = onSnapshot(ticketQuery, (snapshot) => {
      setTickets(snapshot.docs.map((item) => parseTicket(item.id, item.data())));
    }, () => setTickets([]));
    const stopReviews = onSnapshot(reviewQuery, (snapshot) => {
      setReviews(snapshot.docs.map((item) => parseReview(item.id, item.data())));
    }, () => setReviews([]));
    return () => { stopTickets(); stopReviews(); };
  }, [user?.id, user?.roles]);

  useEffect(() => () => {
    const context = audioRef.current;
    audioRef.current = null;
    if (context && context.state !== "closed") void context.close();
  }, []);

  useEffect(() => {
    if (!activeAlert) return;
    const timer = window.setTimeout(() => setActiveAlert(null), 7000);
    return () => window.clearTimeout(timer);
  }, [activeAlert]);

  const products = useMemo(
    () => allProducts.filter((item) => item.status === "published" && item.stock > 0),
    [allProducts],
  );
  const sellerProducts = useMemo(
    () => user ? allProducts.filter((item) => item.storeId === user.id) : [],
    [allProducts, user],
  );

  const signIn = useCallback(async (email: string, password: string, role?: UserRole) => {
    const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    try {
      const profileSnapshot = await getDoc(doc(firestore, "users", credential.user.uid));
      if (!profileSnapshot.exists()) throw new Error("Account profile not found. Please contact support.");
      const profile = parseUser(credential.user.uid, credential.user.email ?? email, profileSnapshot.data());
      if (role && !profile.roles.includes(role)) {
        throw new Error(role === "seller"
          ? "This email is not registered as a seller account."
          : "This email is not registered as a customer account.");
      }
      setUser(profile);
      cacheUser(profile);
      setAuthReady(true);
    } catch (error) {
      await firebaseSignOut(firebaseAuth).catch(() => undefined);
      throw error;
    }
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, input.email.trim(), input.password);
    try {
      const cleanName = input.name.trim();
      const cleanStoreName = input.storeName?.trim();
      await updateProfile(credential.user, { displayName: cleanName });
      await setDoc(doc(firestore, "users", credential.user.uid), {
        name: cleanName,
        email: input.email.trim(),
        mobile: input.mobile.trim(),
        roles: [input.role],
        activeRole: input.role,
        ...(input.role === "seller" ? {
          sellerStatus: "approved",
          storeIds: [credential.user.uid],
          storeName: cleanStoreName,
        } : {}),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (input.role === "seller") {
        await setDoc(doc(firestore, "paanStores", credential.user.uid), {
          ownerId: credential.user.uid,
          name: cleanStoreName || cleanName,
          city: "Hyderabad",
          contactNumber: input.mobile.trim(),
          isOpen: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      const profile = parseUser(credential.user.uid, input.email.trim(), {
        name: cleanName,
        mobile: input.mobile.trim(),
        roles: [input.role],
        storeName: cleanStoreName,
      });
      setUser(profile);
      cacheUser(profile);
      setAuthReady(true);
    } catch (error) {
      await deleteUser(credential.user).catch(() => undefined);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(firebaseAuth, email.trim());
  }, []);
  const signOut = useCallback(async () => {
    cacheUser(null);
    setUser(null);
    await firebaseSignOut(firebaseAuth);
  }, []);

  const addToCart = useCallback((product: Product) => {
    if (cart.length && cart[0].product.storeId !== product.storeId) {
      return "Your cart contains items from another shop. Complete or clear that order first.";
    }
    setCart((current) => {
      const found = current.find((line) => line.product.id === product.id);
      return found
        ? current.map((line) => line.product.id === product.id
          ? { ...line, quantity: Math.min(line.quantity + 1, product.stock) }
          : line)
        : [...current, { product, quantity: 1 }];
    });
    return null;
  }, [cart]);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setCart((current) => current.map((line) => line.product.id === id
      ? { ...line, quantity: Math.max(1, Math.min(quantity, line.product.stock)) }
      : line));
  }, []);
  const removeFromCart = useCallback((id: string) => {
    setCart((current) => current.filter((line) => line.product.id !== id));
  }, []);

  const placeOrder = useCallback(async (input: PlaceOrderInput) => {
    if (!user) throw new Error("Sign in to place your pickup order.");
    if (!cart.length) throw new Error("Your cart is empty.");
    const store = cart[0].product;
    const payload = {
      customerId: user.id,
      customerName: user.name,
      customerMobile: user.mobile,
      items: cart.map((line) => ({ ...line, product: omitUndefined(line.product) })),
      total: cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
      storeId: store.storeId,
      storeName: stores.find((item) => item.id === store.storeId)?.name ?? store.storeName,
      pickupDate: input.pickupDate,
      pickupTime: input.pickupTime,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === "upi" ? "PENDING" : "PAY_AT_PICKUP",
      fulfilment: "pickup",
      stage: "Order placed",
      placedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const orderDoc = await addDoc(collection(firestore, "paanOrders"), payload);
    setCart([]);
    return orderDoc.id;
  }, [cart, stores, user]);

  const publishProduct = useCallback(async (product: ProductInput) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    const store = stores.find((item) => item.id === user.id);
    await addDoc(collection(firestore, "paanProducts"), {
      ...omitUndefined(product),
      storeId: user.id,
      storeName: store?.name ?? user.storeName ?? user.name,
      status: product.stock > 0 ? "published" : "out-of-stock",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [stores, user]);

  const updateProduct = useCallback(async (id: string, product: ProductInput) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    await updateDoc(doc(firestore, "paanProducts", id), {
      ...omitUndefined(product),
      status: product.stock > 0 ? "published" : "out-of-stock",
      updatedAt: serverTimestamp(),
    });
  }, [user]);

  const deactivateProduct = useCallback(async (id: string) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    await updateDoc(doc(firestore, "paanProducts", id), { status: "draft", updatedAt: serverTimestamp() });
  }, [user]);

  const saveStore = useCallback(async (store: StoreInput) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    await setDoc(doc(firestore, "paanStores", user.id), {
      ...omitUndefined(store),
      ownerId: user.id,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }, [user]);

  const updateOrderStage = useCallback(async (id: string, stage: OrderStage) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    await updateDoc(doc(firestore, "paanOrders", id), { stage, updatedAt: serverTimestamp() });
  }, [user]);

  const updatePaymentStatus = useCallback(async (id: string, status: PaymentStatus) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    await updateDoc(doc(firestore, "paanOrders", id), { paymentStatus: status, updatedAt: serverTimestamp() });
  }, [user]);

  const enableAlerts = useCallback(() => {
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioRef.current || audioRef.current.state === "closed") audioRef.current = new AudioContextClass();
    setAlertsEnabled(true);
    alertsEnabledRef.current = true;
    void audioRef.current.resume().then(() => playAlert(audioRef.current!)).catch(() => undefined);
  }, []);

  const createTicket = useCallback(async (order: PickupOrder, issue: string, message: string) => {
    if (!user || user.roles.includes("seller") || order.customerId !== user.id) throw new Error("A customer order is required.");
    await addDoc(collection(firestore, "paanTickets"), {
      orderId: order.id,
      customerId: user.id,
      customerName: user.name,
      storeId: order.storeId,
      issue: issue.trim(),
      message: message.trim(),
      status: "Open",
      createdAtText: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }, [user]);

  const resolveTicket = useCallback(async (id: string, sellerReply: string) => {
    if (!user?.roles.includes("seller")) throw new Error("A seller account is required.");
    await updateDoc(doc(firestore, "paanTickets", id), { status: "Resolved", sellerReply: sellerReply.trim(), updatedAt: serverTimestamp() });
  }, [user]);

  const createReview = useCallback(async (order: PickupOrder, stars: number, comment: string) => {
    if (!user || user.roles.includes("seller") || order.customerId !== user.id || order.stage !== "Collected") throw new Error("Only collected customer orders can be reviewed.");
    await setDoc(doc(firestore, "paanReviews", `${order.id}_${user.id}`), {
      orderId: order.id,
      customerId: user.id,
      customerName: user.name,
      storeId: order.storeId,
      stars: Math.max(1, Math.min(5, stars)),
      comment: comment.trim(),
      createdAtText: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  }, [user]);

  const value = useMemo<AppContextValue>(() => ({
    user,
    authReady,
    products,
    sellerProducts,
    stores,
    catalogReady,
    cart,
    cartCount: cart.reduce((sum, line) => sum + line.quantity, 0),
    cartTotal: cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    orders,
    tickets,
    reviews,
    alertsEnabled,
    activeAlert,
    signIn,
    register,
    resetPassword,
    signOut,
    addToCart,
    setQuantity,
    removeFromCart,
    placeOrder,
    publishProduct,
    updateProduct,
    deactivateProduct,
    saveStore,
    updateOrderStage,
    updatePaymentStatus,
    enableAlerts,
    dismissAlert: () => setActiveAlert(null),
    createTicket,
    resolveTicket,
    createReview,
  }), [
    user, authReady, products, sellerProducts, stores, catalogReady, cart, orders, tickets, reviews,
    alertsEnabled, activeAlert,
    signIn, register, resetPassword, signOut, addToCart, setQuantity, removeFromCart,
    placeOrder, publishProduct, updateProduct, deactivateProduct, saveStore,
    updateOrderStage, updatePaymentStatus, enableAlerts, createTicket, resolveTicket, createReview,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
