import { and, asc, count, eq, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import {
  cartItemAddons,
  cartItems,
  carts,
  menuAddons,
  menus,
  stalls,
} from "../db/schema";
import { AppError } from "../lib/errors";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "../validators/cart.validator";

export type CartAddonDetail = {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
};

export type CartItemMenuDetail = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

export type CartItemDetail = {
  id: string;
  menuId: string;
  quantity: number;
  note: string | null;
  menu: CartItemMenuDetail;
  addons: CartAddonDetail[];
  itemPrice: number;
  subtotal: number;
};

export type CartStallDetail = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  isOpen: boolean;
};

export type CartResult = {
  id: string;
  userId: string;
  stallId: string | null;
  stall: CartStallDetail | null;
  items: CartItemDetail[];
  totalItems: number;
  subtotal: number;
};

type TransactionExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function getOrCreateCart(
  tx: TransactionExecutor,
  userId: string
) {
  const [existingCart] = await tx
    .select()
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (existingCart) {
    return existingCart;
  }

  const [newCart] = await tx
    .insert(carts)
    .values({
      userId,
      stallId: null,
    })
    .returning();

  return newCart;
}

async function buildCartResult(
  tx: TransactionExecutor,
  cartId: string,
  userId: string,
  currentStallId: string | null
): Promise<CartResult> {
  const [stall, itemRows] = await Promise.all([
    currentStallId
      ? tx
          .select({
            id: stalls.id,
            name: stalls.name,
            slug: stalls.slug,
            imageUrl: stalls.imageUrl,
            isOpen: stalls.isOpen,
          })
          .from(stalls)
          .where(eq(stalls.id, currentStallId))
          .limit(1)
          .then((rows) => rows[0] || null)
      : Promise.resolve(null),
    tx
      .select({
        id: cartItems.id,
        menuId: cartItems.menuId,
        quantity: cartItems.quantity,
        note: cartItems.note,
        createdAt: cartItems.createdAt,
        menuName: menus.name,
        menuPrice: menus.price,
        menuImageUrl: menus.imageUrl,
        menuIsAvailable: menus.isAvailable,
      })
      .from(cartItems)
      .innerJoin(menus, eq(cartItems.menuId, menus.id))
      .where(eq(cartItems.cartId, cartId))
      .orderBy(asc(cartItems.createdAt)),
  ]);

  let activeStallId = currentStallId;
  let activeStall = stall;

  if (itemRows.length === 0 && currentStallId !== null) {
    await tx
      .update(carts)
      .set({
        stallId: null,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));
    activeStallId = null;
    activeStall = null;
  }

  const itemIds = itemRows.map((r) => r.id);
  const addonsByItemId = new Map<string, CartAddonDetail[]>();

  if (itemIds.length > 0) {
    const addonRows = await tx
      .select({
        cartItemId: cartItemAddons.cartItemId,
        id: menuAddons.id,
        name: menuAddons.name,
        price: menuAddons.price,
        isAvailable: menuAddons.isAvailable,
      })
      .from(cartItemAddons)
      .innerJoin(menuAddons, eq(cartItemAddons.addonId, menuAddons.id))
      .where(inArray(cartItemAddons.cartItemId, itemIds));

    for (const row of addonRows) {
      const list = addonsByItemId.get(row.cartItemId) || [];
      list.push({
        id: row.id,
        name: row.name,
        price: row.price,
        isAvailable: row.isAvailable,
      });
      addonsByItemId.set(row.cartItemId, list);
    }
  }

  const items: CartItemDetail[] = itemRows.map((row) => {
    const addons = addonsByItemId.get(row.id) || [];
    const addonsTotalPrice = addons.reduce((sum, a) => sum + a.price, 0);
    const itemPrice = row.menuPrice + addonsTotalPrice;
    const subtotal = itemPrice * row.quantity;

    return {
      id: row.id,
      menuId: row.menuId,
      quantity: row.quantity,
      note: row.note,
      menu: {
        id: row.menuId,
        name: row.menuName,
        price: row.menuPrice,
        imageUrl: row.menuImageUrl,
        isAvailable: row.menuIsAvailable,
      },
      addons,
      itemPrice,
      subtotal,
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    id: cartId,
    userId,
    stallId: activeStallId,
    stall: activeStall,
    items,
    totalItems,
    subtotal,
  };
}

export async function getCart(userId: string): Promise<CartResult> {
  return db.transaction(async (tx) => {
    const cart = await getOrCreateCart(tx, userId);
    return buildCartResult(tx, cart.id, userId, cart.stallId);
  });
}

export async function addItem(
  userId: string,
  input: AddCartItemInput
): Promise<CartResult> {
  return db.transaction(async (tx) => {
    const cart = await getOrCreateCart(tx, userId);

    const [menu] = await tx
      .select()
      .from(menus)
      .where(eq(menus.id, input.menuId))
      .limit(1);

    if (!menu) {
      throw new AppError("Menu tidak ditemukan", 404);
    }

    if (!menu.isAvailable) {
      throw new AppError("Menu tidak tersedia saat ini", 400);
    }

    if (cart.stallId !== null && cart.stallId !== menu.stallId) {
      throw new AppError(
        "Keranjang hanya boleh berisi menu dari satu warung. Kosongkan keranjang untuk memesan dari warung ini.",
        409
      );
    }

    if (input.addonIds && input.addonIds.length > 0) {
      const foundAddons = await tx
        .select()
        .from(menuAddons)
        .where(inArray(menuAddons.id, input.addonIds));

      if (foundAddons.length !== input.addonIds.length) {
        throw new AppError("Beberapa add-on tidak ditemukan", 400);
      }

      for (const addon of foundAddons) {
        if (addon.menuId !== menu.id) {
          throw new AppError(
            "Add-on tidak sesuai dengan menu yang dipilih",
            400
          );
        }
        if (!addon.isAvailable) {
          throw new AppError(
            `Add-on "${addon.name}" tidak tersedia saat ini`,
            400
          );
        }
      }
    }

    let activeStallId = cart.stallId;
    if (activeStallId === null) {
      await tx
        .update(carts)
        .set({
          stallId: menu.stallId,
          updatedAt: new Date(),
        })
        .where(eq(carts.id, cart.id));
      activeStallId = menu.stallId;
    }

    const candidateItems = await tx
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.menuId, menu.id)
        )
      );

    const sortedInputAddons = [...(input.addonIds || [])].sort();
    let matchedItemId: string | null = null;

    for (const candidate of candidateItems) {
      const candidateNote = candidate.note || null;
      const inputNote = input.note || null;
      if (candidateNote !== inputNote) {
        continue;
      }

      const candidateAddons = await tx
        .select({ addonId: cartItemAddons.addonId })
        .from(cartItemAddons)
        .where(eq(cartItemAddons.cartItemId, candidate.id));

      const sortedCandidateAddons = candidateAddons
        .map((a) => a.addonId)
        .sort();

      if (
        sortedInputAddons.length === sortedCandidateAddons.length &&
        sortedInputAddons.every((id, idx) => id === sortedCandidateAddons[idx])
      ) {
        matchedItemId = candidate.id;
        break;
      }
    }

    if (matchedItemId) {
      await tx
        .update(cartItems)
        .set({
          quantity: sql`${cartItems.quantity} + ${input.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, matchedItemId));
    } else {
      const [insertedItem] = await tx
        .insert(cartItems)
        .values({
          cartId: cart.id,
          menuId: menu.id,
          quantity: input.quantity,
          note: input.note || null,
        })
        .returning();

      if (input.addonIds && input.addonIds.length > 0) {
        await tx.insert(cartItemAddons).values(
          input.addonIds.map((addonId) => ({
            cartItemId: insertedItem.id,
            addonId,
          }))
        );
      }
    }

    return buildCartResult(tx, cart.id, userId, activeStallId);
  });
}

export async function updateItem(
  userId: string,
  cartItemId: string,
  input: UpdateCartItemInput
): Promise<CartResult> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        cartItemId: cartItems.id,
        cartId: cartItems.cartId,
        menuId: cartItems.menuId,
        stallId: carts.stallId,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(eq(cartItems.id, cartItemId), eq(carts.userId, userId)))
      .limit(1);

    if (!row) {
      throw new AppError("Item keranjang tidak ditemukan", 404);
    }

    if (input.addonIds !== undefined) {
      if (input.addonIds.length > 0) {
        const foundAddons = await tx
          .select()
          .from(menuAddons)
          .where(inArray(menuAddons.id, input.addonIds));

        if (foundAddons.length !== input.addonIds.length) {
          throw new AppError("Beberapa add-on tidak ditemukan", 400);
        }

        for (const addon of foundAddons) {
          if (addon.menuId !== row.menuId) {
            throw new AppError(
              "Add-on tidak sesuai dengan menu yang dipilih",
              400
            );
          }
          if (!addon.isAvailable) {
            throw new AppError(
              `Add-on "${addon.name}" tidak tersedia saat ini`,
              400
            );
          }
        }
      }

      await tx
        .delete(cartItemAddons)
        .where(eq(cartItemAddons.cartItemId, cartItemId));

      if (input.addonIds.length > 0) {
        await tx.insert(cartItemAddons).values(
          input.addonIds.map((addonId) => ({
            cartItemId,
            addonId,
          }))
        );
      }
    }

    await tx
      .update(cartItems)
      .set({
        ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
        ...(input.note !== undefined ? { note: input.note || null } : {}),
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId));

    return buildCartResult(tx, row.cartId, userId, row.stallId);
  });
}

export async function removeItem(
  userId: string,
  cartItemId: string
): Promise<CartResult> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({
        cartItemId: cartItems.id,
        cartId: cartItems.cartId,
        stallId: carts.stallId,
      })
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(eq(cartItems.id, cartItemId), eq(carts.userId, userId)))
      .limit(1);

    if (!row) {
      throw new AppError("Item keranjang tidak ditemukan", 404);
    }

    await tx.delete(cartItems).where(eq(cartItems.id, cartItemId));

    const [{ count: remainingCount }] = await tx
      .select({ count: count() })
      .from(cartItems)
      .where(eq(cartItems.cartId, row.cartId));

    let finalStallId = row.stallId;
    if (Number(remainingCount) === 0) {
      await tx
        .update(carts)
        .set({
          stallId: null,
          updatedAt: new Date(),
        })
        .where(eq(carts.id, row.cartId));
      finalStallId = null;
    }

    return buildCartResult(tx, row.cartId, userId, finalStallId);
  });
}

export async function clearCart(userId: string): Promise<CartResult> {
  return db.transaction(async (tx) => {
    const cart = await getOrCreateCart(tx, userId);

    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    await tx
      .update(carts)
      .set({
        stallId: null,
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cart.id));

    return buildCartResult(tx, cart.id, userId, null);
  });
}
