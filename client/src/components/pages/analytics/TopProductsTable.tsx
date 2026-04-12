"use client";

import Image from "next/image";
import type { TopProduct } from "@/lib/analyticsApi";

interface Props { data: TopProduct[] }

export default function TopProductsTable({ data }: Props) {
  const shouldScroll = data.length > 5;

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 mb-0.5">Most Purchased Products</h2>
      <p className="text-xs text-gray-400 mb-5">Your top 10 most frequently bought items</p>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No purchases yet.</div>
      ) : (
        <div
          className={`overflow-x-auto ${shouldScroll ? "max-h-[360px] overflow-y-auto rounded-xl" : ""}`}
        >
          <table className="w-full text-sm">
            <thead className={shouldScroll ? "sticky top-0 z-10 bg-white" : ""}>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 pr-4 text-xs font-semibold text-gray-500">Product</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500">Quantity</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500">Total Spent</th>
                <th className="text-right py-2.5 px-4 text-xs font-semibold text-gray-500">Avg Price</th>
                <th className="text-right py-2.5 pl-4 text-xs font-semibold text-gray-500">Orders</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.productId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={p.image} alt={p.name} width={36} height={36} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">📦</div>
                      )}
                      <span className="font-medium text-gray-800 line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-700">{p.quantity}</td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-800">${p.totalSpent.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-gray-500">${p.avgPrice.toFixed(2)}</td>
                  <td className="py-3 pl-4 text-right text-gray-700">{p.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
