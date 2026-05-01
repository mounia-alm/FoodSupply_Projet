import React, { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import useProfile from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";

const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
};
const formatPrice = (value) => `${Number(value || 0)} DZD`;
const normalizeUnit = (unit) => {
  if (!unit) return "piece";
  if (String(unit).toLowerCase() === "piece") return "piece";
  return String(unit).toUpperCase();
};
const formatQuantityUnit = (qty, unit) => {
  const normalized = normalizeUnit(unit);
  if (normalized === "piece") return `${qty} pieces`;
  return `${qty} ${normalized}`;
};

function StatusBadge({ status }) {
  const cls =
    status === "pending"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : status === "confirmed"
        ? "bg-sky-50 text-sky-800 border-sky-200"
        : status === "preparing"
          ? "bg-yellow-50 text-yellow-800 border-yellow-200"
          : status === "shipped"
            ? "bg-indigo-50 text-indigo-800 border-indigo-200"
            : "bg-lime-50 text-lime-800 border-lime-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function groupBySupplier(items) {
  const map = new Map();
  for (const p of items) {
    const key = p.supplier_name || "Supplier";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }
  return map;
}

export default function RestaurantDashboard() {
  const { userId } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile(userId);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");

  const restaurantName = profile?.full_name || "";
  const managerName = profile?.full_name || "";
  const restaurantAddress = profile?.address || "";
  const phone = profile?.phone_number || "";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [p, o] = await Promise.all([api.products.list(), api.orders.list({ restaurant_id: userId })]);
        if (!cancelled) {
          setProducts(Array.isArray(p) ? p : []);
          setOrders(Array.isArray(o) ? o : []);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load restaurant dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (userId) load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [p, o] = await Promise.all([api.products.list(), api.orders.list({ restaurant_id: userId })]);
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
    } catch (err) {
      setError(err?.message || "Failed to refresh");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const s = supplierFilter.trim().toLowerCase();
    const p = productFilter.trim().toLowerCase();
    return products.filter((item) => {
      const supplierName = String(item.supplier_name || "").toLowerCase();
      const productName = String(item.name || "").toLowerCase();
      return (!s || supplierName.includes(s)) && (!p || productName.includes(p));
    });
  }, [products, supplierFilter, productFilter]);
  const grouped = useMemo(() => groupBySupplier(filteredProducts), [filteredProducts]);
  const productPriceById = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(Number(p.id), Number(p.price || 0)));
    return map;
  }, [products]);
  const orderTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    return Number(qty || 0) * Number(selectedProduct.price || 0);
  }, [qty, selectedProduct]);

  function openOrder(product) {
    setSelectedProduct(product);
    setQty(1);
    setAdditionalDetails("");
  }

  function closeModal() {
    setSelectedProduct(null);
    setSubmittingOrder(false);
  }

  async function submitOrder(e) {
    e.preventDefault();
    if (!selectedProduct || !profile) return;
    if (Number(qty) > Number(selectedProduct.quantity_available || 0)) {
      setError("Requested quantity exceeds available stock.");
      return;
    }
    setSubmittingOrder(true);
    setError("");
    try {
      const payload = {
        restaurant_id: Number(userId),
        restaurant_name: restaurantName,
        manager_name: managerName,
        restaurant_address: restaurantAddress,
        phone: phone,
        supplier_id: selectedProduct.supplier_id,
        supplier_name: selectedProduct.supplier_name,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        quantity: Number(qty),
        unit: normalizeUnit(selectedProduct.unit),
        price: selectedProduct.price,
        additional_details: additionalDetails || "",
        status: "pending",
      };
      await api.orders.create(payload);
      closeModal();
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to create order");
    } finally {
      setSubmittingOrder(false);
    }
  }

  async function cancelOrder(orderId) {
    if (!window.confirm("Cancel this order?")) return;
    setError("");
    try {
      await api.orders.patch(orderId, { status: "cancelled" });
      await refresh();
    } catch (err) {
      try {
        await api.orders.remove(orderId);
        await refresh();
      } catch (deleteErr) {
        setError(deleteErr?.response?.data?.detail || deleteErr?.message || "Failed to cancel order");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-livrili-orangeDark">Restaurant Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Browse supplier catalogs and place bulk orders.</p>
      </div>

      {(profileLoading || loading) && <div className="rounded-xl bg-white p-4 shadow-sm">Loading...</div>}
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {profileError && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{profileError}</div>}

      {!loading && (
        <>
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Supplier products</h2>
              <span className="text-xs font-semibold text-gray-500">{products.length} products</span>
            </div>
            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                placeholder="Filter by supplier name"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
              />
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2"
                placeholder="Filter by product name"
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
              />
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-600">
                No products available right now.
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(grouped.entries()).map(([supplierName, plist]) => (
                  <div key={supplierName}>
                    <h3 className="mb-3 text-base font-semibold text-gray-900">{supplierName}</h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {plist.map((p) => (
                        <div key={p.id} className="rounded-2xl border p-4">
                          <div className="flex items-start gap-3">
                            {p.image_url ? (
                              <img src={p.image_url} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-livrili-orangeLight text-xs font-semibold text-livrili-orangeDark">
                                No img
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="truncate text-base font-semibold">{p.name}</div>
                              <div className="mt-1 text-sm text-gray-600">
                                {p.description ? p.description : <span className="italic text-gray-400">No description</span>}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-livrili-orangeLight px-3 py-1 text-xs font-semibold text-livrili-orangeDark">
                              {formatPrice(p.price)} / {normalizeUnit(p.unit)}
                            </span>
                            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                              Qty: {formatQuantityUnit(p.quantity_available, p.unit)}
                            </span>
                            <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                              Delivery: {p.delivery_time}
                            </span>
                          </div>
                          <div className="mt-4">
                            <button
                              className="w-full rounded-xl bg-livrili-orangeDark py-2.5 font-semibold text-white hover:bg-livrili-orangeMid"
                              onClick={() => openOrder(p)}
                            >
                              Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">My orders</h2>
              <span className="text-xs font-semibold text-gray-500">{orders.length} orders</span>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-600">
                No orders yet. Place your first order from the products list.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {orders.map((o) => {
                  const unitPrice = Number(o.price ?? productPriceById.get(Number(o.product_id)) ?? 0);
                  const totalPrice = Number(o.quantity || 0) * unitPrice;
                  return (
                  <div key={o.id} className="rounded-2xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">Order #{o.id}</div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Supplier: <span className="font-semibold text-gray-900">{o.supplier_name}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Product: <span className="font-semibold text-gray-900">{o.product_name}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Quantity: <span className="font-semibold text-gray-900">{formatQuantityUnit(o.quantity, o.unit)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Unit price: <span className="font-semibold text-gray-900">{formatPrice(unitPrice)}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Total: <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                    </div>
                    {o.additional_details ? (
                      <div className="mt-2 text-sm text-gray-600">
                        Notes: <span className="font-semibold text-gray-900">{o.additional_details}</span>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => cancelOrder(o.id)}
                      className="mt-4 w-full rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  </div>
                )})}
              </div>
            )}
          </section>
        </>
      )}

      {/* Order modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Place order</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedProduct.name} • {selectedProduct.supplier_name}
                </p>
                <p className="mt-1 text-sm font-semibold text-livrili-orangeDark">
                  Price: {formatPrice(selectedProduct.price)} / {normalizeUnit(selectedProduct.unit)}
                </p>
              </div>
              <button className="rounded-xl border px-3 py-1 text-sm" onClick={closeModal} type="button">
                Close
              </button>
            </div>

            <form onSubmit={submitOrder} className="mt-4 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Available</label>
                  <div className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">
                    {selectedProduct.quantity_available}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Additional details (optional)</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Any delivery / packaging notes"
                />
              </div>

              <div className="rounded-xl bg-livrili-orangePale p-3 text-sm text-gray-700">
                <div className="font-semibold">Auto-filled restaurant info</div>
                <div className="mt-1">
                  {restaurantName} • {phone}
                </div>
                <div className="mt-1">{restaurantAddress}</div>
              </div>
              <div className="rounded-xl bg-livrili-orangePale p-3 text-sm">
                <span className="font-semibold text-gray-900">Total price: </span>
                <span className="font-bold text-livrili-orangeDark">{formatPrice(orderTotal)}</span>
              </div>

              <button
                type="submit"
                disabled={submittingOrder}
                className="rounded-xl bg-livrili-orangeDark py-2.5 font-semibold text-white hover:bg-livrili-orangeMid disabled:opacity-60"
              >
                {submittingOrder ? "Submitting..." : "Submit order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

