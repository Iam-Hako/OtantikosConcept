"use client";

import React from "react";
import ProductsPage from "@/app/urunler/page";

// Bu sayfa kategori slug'ına göre ürünleri filtreler.
// ProductsPage zaten URL'den slug'ı okuyarak doğru filtrelemeyi yapar.
export default function CategoryProductsPage() {
  return <ProductsPage />;
}
