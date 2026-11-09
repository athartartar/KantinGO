import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import {
  categories,
  menuAddons,
  menus,
  stalls,
  users,
  vouchers,
} from "./schema/index";

async function runSeed() {
  await db.transaction(async (tx) => {
    const passwordHash = await bcryptjs.hash("password123", 10);

    await tx
      .insert(users)
      .values({
        name: "Mahasiswa Demo",
        email: "demo@kantingo.com",
        passwordHash,
        phone: "081234567890",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
        points: 150,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: "Mahasiswa Demo",
          passwordHash,
          phone: "081234567890",
          points: 150,
          updatedAt: new Date(),
        },
      });

    const categoryList = [
      { name: "Nasi", slug: "nasi", iconUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=200", sortOrder: 1 },
      { name: "Mie", slug: "mie", iconUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200", sortOrder: 2 },
      { name: "Western", slug: "western", iconUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200", sortOrder: 3 },
      { name: "Camilan", slug: "camilan", iconUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200", sortOrder: 4 },
      { name: "Minuman", slug: "minuman", iconUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=200", sortOrder: 5 },
    ];

    for (const cat of categoryList) {
      await tx
        .insert(categories)
        .values(cat)
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: cat.name,
            iconUrl: cat.iconUrl,
            sortOrder: cat.sortOrder,
            updatedAt: new Date(),
          },
        });
    }

    const insertedCategories = await tx.select().from(categories);
    const categoryMap = new Map(insertedCategories.map((c) => [c.slug, c.id]));

    const stallList = [
      {
        name: "Warung Bu Siti",
        slug: "warung-bu-siti",
        description: "Masakan rumahan khas Jawa dan aneka nasi mantap",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
        locationNote: "Lantai 1 Kantin Utama No. 3",
        openTime: "07:00",
        closeTime: "17:00",
        isOpen: true,
        ratingAverage: "4.8",
        ratingCount: 154,
      },
      {
        name: "Bakmi & Mie Ayam Barokah",
        slug: "mie-ayam-barokah",
        description: "Mie ayam kenyal dan bakso kuah gurih",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
        locationNote: "Lantai 1 Kantin Utama No. 5",
        openTime: "08:00",
        closeTime: "18:00",
        isOpen: true,
        ratingAverage: "4.7",
        ratingCount: 98,
      },
      {
        name: "Kampus Burger & Steak",
        slug: "kampus-burger-steak",
        description: "Burger juicy, pasta lezat, dan steak ramah kantong",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600",
        locationNote: "Lantai 2 Kantin Barat No. 12",
        openTime: "09:00",
        closeTime: "20:00",
        isOpen: true,
        ratingAverage: "4.6",
        ratingCount: 76,
      },
      {
        name: "Pojok Camilan & Gorengan",
        slug: "pojok-camilan",
        description: "Aneka gorengan hangat, cireng crispy, dan dimsum",
        imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600",
        locationNote: "Lantai 1 Kantin Timur No. 1",
        openTime: "07:30",
        closeTime: "16:30",
        isOpen: true,
        ratingAverage: "4.9",
        ratingCount: 210,
      },
      {
        name: "Kedai Kopi & Teh Segar",
        slug: "kedai-kopi-teh-segar",
        description: "Kopi susu gula aren, aneka teh buah, dan minuman segar",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600",
        locationNote: "Lantai 1 Kantin Tengah No. 8",
        openTime: "07:00",
        closeTime: "19:00",
        isOpen: true,
        ratingAverage: "4.8",
        ratingCount: 130,
      },
    ];

    for (const stall of stallList) {
      await tx
        .insert(stalls)
        .values(stall)
        .onConflictDoUpdate({
          target: stalls.slug,
          set: {
            name: stall.name,
            description: stall.description,
            imageUrl: stall.imageUrl,
            locationNote: stall.locationNote,
            openTime: stall.openTime,
            closeTime: stall.closeTime,
            isOpen: stall.isOpen,
            ratingAverage: stall.ratingAverage,
            ratingCount: stall.ratingCount,
            updatedAt: new Date(),
          },
        });
    }

    const insertedStalls = await tx.select().from(stalls);
    const stallMap = new Map(insertedStalls.map((s) => [s.slug, s.id]));

    const menuSeedData = [
      {
        stallSlug: "warung-bu-siti",
        categorySlug: "nasi",
        name: "Nasi Ayam Geprek Sambal Bawang",
        description: "Ayam krispi digeprek dengan sambal bawang segar",
        imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
        price: 18000,
        isAvailable: true,
        addons: [
          { name: "Sambal Ekstra", price: 3000 },
          { name: "Telur Dadar", price: 5000 },
          { name: "Keju Mozzarella", price: 6000 },
        ],
      },
      {
        stallSlug: "warung-bu-siti",
        categorySlug: "nasi",
        name: "Nasi Rames Spesial",
        description: "Nasi hangat dengan aneka lauk pauk khas rumahan",
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
        price: 22000,
        isAvailable: true,
        addons: [
          { name: "Tambah Rendang", price: 10000 },
          { name: "Telur Balado", price: 5000 },
        ],
      },
      {
        stallSlug: "warung-bu-siti",
        categorySlug: "nasi",
        name: "Nasi Uduk Komplit",
        description: "Nasi uduk harum bertabur bawang goreng, bihun, dan tempe orek",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        price: 20000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "warung-bu-siti",
        categorySlug: "nasi",
        name: "Sayur Asem Segar",
        description: "Sayur asem khas Jawa dengan kuah segar asam gurih",
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500",
        price: 8000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "warung-bu-siti",
        categorySlug: "camilan",
        name: "Tempe Mendoan Gurih",
        description: "Tempe goreng tepung lembut disajikan dengan kecap cabe rawit",
        imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500",
        price: 10000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "warung-bu-siti",
        categorySlug: "minuman",
        name: "Es Teh Manis Melati",
        description: "Teh melati wangi dengan es batu pelepas dahaga",
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
        price: 5000,
        isAvailable: true,
        addons: [],
      },

      {
        stallSlug: "mie-ayam-barokah",
        categorySlug: "mie",
        name: "Mie Ayam Jamur Pangsit",
        description: "Mie kenyal buatan sendiri dengan potongan ayam jamur manis gurih",
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500",
        price: 17000,
        isAvailable: true,
        addons: [
          { name: "Pangsit Goreng", price: 3000 },
          { name: "Bakso Sapi", price: 5000 },
          { name: "Ceker Ayam", price: 4000 },
        ],
      },
      {
        stallSlug: "mie-ayam-barokah",
        categorySlug: "mie",
        name: "Mie Ayam Yamin Pedas",
        description: "Mie yamin manis pedas dengan taburan ayam cincang",
        imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500",
        price: 18000,
        isAvailable: true,
        addons: [
          { name: "Pangsit Rebus", price: 3000 },
          { name: "Bakso Sapi", price: 5000 },
        ],
      },
      {
        stallSlug: "mie-ayam-barokah",
        categorySlug: "mie",
        name: "Bihun Bebek Gurih",
        description: "Bihun lembut disiram kaldu bebek pekat dan rempah harum",
        imageUrl: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500",
        price: 23000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "mie-ayam-barokah",
        categorySlug: "camilan",
        name: "Pangsit Goreng Renyah",
        description: "Pangsit goreng renyah isi olahan ayam udang",
        imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500",
        price: 12000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "mie-ayam-barokah",
        categorySlug: "minuman",
        name: "Es Jeruk Murni",
        description: "Perasan jeruk asli segar kaya vitamin C",
        imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500",
        price: 6000,
        isAvailable: true,
        addons: [],
      },

      {
        stallSlug: "kampus-burger-steak",
        categorySlug: "western",
        name: "Classic Beef Cheese Burger",
        description: "Patty sapi panggang empuk dengan lumeran keju cheddar",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
        price: 25000,
        isAvailable: true,
        addons: [
          { name: "Double Beef Patty", price: 12000 },
          { name: "Extra Cheese", price: 4000 },
          { name: "French Fries", price: 8000 },
        ],
      },
      {
        stallSlug: "kampus-burger-steak",
        categorySlug: "western",
        name: "Spaghetti Bolognese",
        description: "Pasta al dente dengan saus daging sapi cincang tomat segar",
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3d5d6281741?w=500",
        price: 22000,
        isAvailable: true,
        addons: [
          { name: "Extra Parmesan", price: 3000 },
          { name: "Garlic Bread", price: 5000 },
        ],
      },
      {
        stallSlug: "kampus-burger-steak",
        categorySlug: "western",
        name: "Crispy Chicken Steak",
        description: "Steak fillet ayam berbalut tepung renyah dengan saus gurih",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=500",
        price: 24000,
        isAvailable: true,
        addons: [
          { name: "Mushroom Sauce", price: 4000 },
          { name: "Blackpepper Sauce", price: 4000 },
        ],
      },
      {
        stallSlug: "kampus-burger-steak",
        categorySlug: "camilan",
        name: "French Fries Gurih",
        description: "Kentang goreng stik renyah bertabur bumbu keju",
        imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500",
        price: 15000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "kampus-burger-steak",
        categorySlug: "minuman",
        name: "Iced Lemon Tea",
        description: "Kombinasi teh hitam dan sari lemon dingin menyegarkan",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500",
        price: 7000,
        isAvailable: true,
        addons: [],
      },

      {
        stallSlug: "pojok-camilan",
        categorySlug: "camilan",
        name: "Tahu Walik Crispy",
        description: "Tahu dibalik dengan isian daging ayam krispi",
        imageUrl: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500",
        price: 12000,
        isAvailable: true,
        addons: [
          { name: "Saus Keju", price: 3000 },
          { name: "Sambal Kecap Pedas", price: 2000 },
        ],
      },
      {
        stallSlug: "pojok-camilan",
        categorySlug: "camilan",
        name: "Cireng Bumbu Rujak",
        description: "Aci digoreng kenyal gurih ditemani bumbu rujak pedas manis",
        imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
        price: 10000,
        isAvailable: true,
        addons: [
          { name: "Ekstra Bumbu Rujak", price: 2000 },
        ],
      },
      {
        stallSlug: "pojok-camilan",
        categorySlug: "camilan",
        name: "Siomay Ikan Bandung",
        description: "Siomay kukus ikan tenggiri dengan siraman bumbu kacang kental",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        price: 18000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "pojok-camilan",
        categorySlug: "nasi",
        name: "Nasi Bakar Tongkol Suwir",
        description: "Nasi gurih berbungkus daun pisang dengan isian tongkol pedas",
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
        price: 16000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "pojok-camilan",
        categorySlug: "minuman",
        name: "Es Cincau Susu",
        description: "Cincau hitam kenyal berpadu susu segar manis",
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
        price: 8000,
        isAvailable: true,
        addons: [],
      },

      {
        stallSlug: "kedai-kopi-teh-segar",
        categorySlug: "minuman",
        name: "Kopi Susu Gula Aren",
        description: "Espresso robusta mantap dipadu susu creamy dan gula aren asli",
        imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500",
        price: 15000,
        isAvailable: true,
        addons: [
          { name: "Extra Espresso Shot", price: 4000 },
          { name: "Jelly Cincau", price: 3000 },
          { name: "Oat Milk Upgrade", price: 5000 },
        ],
      },
      {
        stallSlug: "kedai-kopi-teh-segar",
        categorySlug: "minuman",
        name: "Matcha Latte Ice",
        description: "Bubuk matcha Jepang murni dengan susu lembut",
        imageUrl: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500",
        price: 18000,
        isAvailable: true,
        addons: [
          { name: "Boba Pearl", price: 3000 },
          { name: "Cheese Foam", price: 4000 },
        ],
      },
      {
        stallSlug: "kedai-kopi-teh-segar",
        categorySlug: "minuman",
        name: "Earl Grey Milk Tea",
        description: "Teh earl grey beraroma bergamot dengan susu gurih",
        imageUrl: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500",
        price: 16000,
        isAvailable: true,
        addons: [
          { name: "Boba Pearl", price: 3000 },
          { name: "Egg Pudding", price: 3000 },
        ],
      },
      {
        stallSlug: "kedai-kopi-teh-segar",
        categorySlug: "camilan",
        name: "Roti Bakar Cokelat Keju",
        description: "Roti panggang mentega dengan meses melimpah dan keju parut",
        imageUrl: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500",
        price: 14000,
        isAvailable: true,
        addons: [],
      },
      {
        stallSlug: "kedai-kopi-teh-segar",
        categorySlug: "western",
        name: "Croissant Mentega Hangat",
        description: "Pastry renyah berlapis dengan aroma mentega harum",
        imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500",
        price: 16000,
        isAvailable: true,
        addons: [],
      },
    ];

    for (const item of menuSeedData) {
      const stallId = stallMap.get(item.stallSlug);
      const categoryId = categoryMap.get(item.categorySlug);

      if (!stallId || !categoryId) {
        continue;
      }

      const existingMenus = await tx
        .select()
        .from(menus)
        .where(eq(menus.name, item.name));

      let menuId: string;
      const existingMenu = existingMenus.find((m) => m.stallId === stallId);

      if (existingMenu) {
        menuId = existingMenu.id;
        await tx
          .update(menus)
          .set({
            categoryId,
            description: item.description,
            imageUrl: item.imageUrl,
            price: item.price,
            isAvailable: item.isAvailable,
            updatedAt: new Date(),
          })
          .where(eq(menus.id, menuId));
      } else {
        const [insertedMenu] = await tx
          .insert(menus)
          .values({
            stallId,
            categoryId,
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            price: item.price,
            isAvailable: item.isAvailable,
          })
          .returning();
        menuId = insertedMenu.id;
      }

      if (item.addons.length > 0) {
        const existingAddons = await tx
          .select()
          .from(menuAddons)
          .where(eq(menuAddons.menuId, menuId));

        for (const addon of item.addons) {
          const match = existingAddons.find((a) => a.name === addon.name);
          if (match) {
            await tx
              .update(menuAddons)
              .set({
                price: addon.price,
                updatedAt: new Date(),
              })
              .where(eq(menuAddons.id, match.id));
          } else {
            await tx.insert(menuAddons).values({
              menuId,
              name: addon.name,
              price: addon.price,
              isAvailable: true,
            });
          }
        }
      }
    }

    const voucherList = [
      {
        code: "POINREWARD20",
        title: "Voucher Poin Potongan Rp 20.000",
        description: "Tukar 100 poin untuk potongan langsung Rp 20.000 belanja di semua warung mitra",
        type: "fixed" as const,
        value: 20000,
        minPurchase: 30000,
        maxDiscount: 20000,
        validUntil: new Date("2030-12-31T23:59:59Z"),
        isActive: true,
        isPointReward: true,
      },
      {
        code: "HEMAT10",
        title: "Diskon 10% Semua Menu",
        description: "Nikmati potongan belanja 10% dengan minimal transaksi Rp 30.000",
        type: "percentage" as const,
        value: 10,
        minPurchase: 30000,
        maxDiscount: 10000,
        validUntil: new Date("2030-12-31T23:59:59Z"),
        isActive: true,
        isPointReward: false,
      },
      {
        code: "KANTINGO5K",
        title: "Potongan Rp 5.000 Khusus Mahasiswa",
        description: "Potongan langsung Rp 5.000 untuk transaksi minimal Rp 25.000",
        type: "fixed" as const,
        value: 5000,
        minPurchase: 25000,
        maxDiscount: 5000,
        validUntil: new Date("2030-12-31T23:59:59Z"),
        isActive: true,
        isPointReward: false,
      },
    ];

    for (const v of voucherList) {
      await tx
        .insert(vouchers)
        .values(v)
        .onConflictDoUpdate({
          target: vouchers.code,
          set: {
            title: v.title,
            description: v.description,
            type: v.type,
            value: v.value,
            minPurchase: v.minPurchase,
            maxDiscount: v.maxDiscount,
            validUntil: v.validUntil,
            isActive: v.isActive,
            isPointReward: v.isPointReward,
            updatedAt: new Date(),
          },
        });
    }
  });

  console.log("Seeding selesai!");
}

runSeed()
  .catch((err) => {
    console.error("Gagal menjalankan seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
