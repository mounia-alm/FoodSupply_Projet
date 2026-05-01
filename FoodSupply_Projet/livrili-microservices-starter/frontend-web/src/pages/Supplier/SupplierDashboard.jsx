import React, { useEffect, useMemo, useState } from "react";

import api from "../../services/api";
import useProfile from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";

const STATUS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];
const UNIT_OPTIONS = ["KG", "ML", "piece"];
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
      {status}
    </span>
  );
}

export default function SupplierDashboard() {
  const { userId } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile(userId);

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchProduct, setSearchProduct] = useState("");
  const [searchOrder, setSearchOrder] = useState("");
  const [editing, setEditing] = useState(null);

  const supplierName = profile?.full_name || "";

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    quantity_available: 0,
    unit: "KG",
    delivery_time: "24h",
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [p, o] = await Promise.all([
          api.products.list({ supplier_id: userId }),
          api.orders.list({ supplier_id: userId }),
        ]);
        if (!cancelled) {
          setProducts(Array.isArray(p) ? p : []);
          setOrders(Array.isArray(o) ? o : []);
        }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load dashboard");
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
      const [p, o] = await Promise.all([
        api.products.list({ supplier_id: userId }),
        api.orders.list({ supplier_id: userId }),
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setOrders(Array.isArray(o) ? o : []);
    } catch (err) {
      setError(err?.message || "Failed to refresh");
    } finally {
      setLoading(false);
    }
  }

  async function submitProduct(e) {
    e.preventDefault();
    setError("");
    try {
      if (!profile) {
        setError("Supplier profile not found yet. Please register again.");
        return;
      }
      const payload = {
        supplier_id: Number(userId),
        supplier_name: supplierName,
        name: productForm.name,
        price: productForm.price,
        description: productForm.description,
        image_url: productForm.image_url || "",
        quantity_available: Number(productForm.quantity_available || 0),
        unit: normalizeUnit(productForm.unit),
        delivery_time: productForm.delivery_time || "24h",
        is_active: true,
      };
      await api.products.create(payload);
      setProductForm((f) => ({ ...f, name: "", price: "", description: "", image_url: "", quantity_available: 0, unit: "KG" }));
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to add product");
    }
  }

  async function updateStatus(orderId, newStatus) {
    setError("");
    try {
      await api.orders.patchStatus(orderId, newStatus);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to update status");
    }
  }

  async function updateProduct(e) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    try {
      await api.products.patch(editing.id, {
        name: editing.name,
        price: editing.price,
        description: editing.description || "",
        quantity_available: Number(editing.quantity_available || 0),
        unit: normalizeUnit(editing.unit),
      });
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to update product");
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    setError("");
    try {
      await api.products.remove(product.id);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || "Failed to delete product");
    }
  }

  const filteredProducts = useMemo(() => {
    const q = searchProduct.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => String(p.name || "").toLowerCase().includes(q));
  }, [products, searchProduct]);

  const filteredOrders = useMemo(() => {
    const q = searchOrder.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        String(o.product_name || "").toLowerCase().includes(q) ||
        String(o.restaurant_name || "").toLowerCase().includes(q)
    );
  }, [orders, searchOrder]);
  const productMetaById = useMemo(() => {
    const m = new Map();
    products.forEach((p) => m.set(Number(p.id), p));
    return m;
  }, [products]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-livrili-greenDark">Supplier Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Manage products and incoming restaurant orders.</p>
      </div>

      {(profileLoading || loading) && <div className="rounded-xl bg-white p-4 shadow-sm">Loading...</div>}
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {profileError && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{profileError}</div>}

      {!loading && (
        <>
          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add a new product</h2>
              <span className="text-xs font-semibold text-gray-500">Supplier: {supplierName || "—"}</span>
            </div>

            <form onSubmit={submitProduct} className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Product name</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Unit</label>
                <select
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={productForm.unit}
                  onChange={(e) => setProductForm((f) => ({ ...f, unit: e.target.value }))}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={productForm.description}
                  onChange={(e) => setProductForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Optional description shown to restaurants"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Image URL (optional)</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity available</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  type="number"
                  value={productForm.quantity_available}
                  onChange={(e) => setProductForm((f) => ({ ...f, quantity_available: e.target.value }))}
                  min={0}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Delivery time</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={productForm.delivery_time}
                  onChange={(e) => setProductForm((f) => ({ ...f, delivery_time: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-livrili-greenDark py-2.5 font-semibold text-white hover:bg-livrili-greenMid"
                >
                  Add product
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your products</h2>
              <span className="text-xs font-semibold text-gray-500">{products.length} items</span>
            </div>
            <input
              className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2"
              placeholder="Search by product name"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-600">
                No products yet. Add one above.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="rounded-2xl border p-4">
                    <div className="flex items-start gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-16 w-16 rounded-xl object-cover" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-livrili-greenPale text-xs font-semibold text-livrili-greenDark">
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
                      <span className="rounded-full bg-livrili-greenPale px-3 py-1 text-xs font-semibold text-livrili-greenDark">
                        {formatPrice(p.price)} / {normalizeUnit(p.unit)}
                      </span>
                      <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        Qty: {formatQuantityUnit(p.quantity_available, p.unit)}
                      </span>
                      <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        Delivery: {p.delivery_time}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="rounded-xl border border-livrili-greenLight px-3 py-2 text-sm font-semibold text-livrili-greenDark hover:bg-livrili-greenPale"
                        onClick={() => setEditing({ ...p, unit: normalizeUnit(p.unit) })}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        onClick={() => removeProduct(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Incoming orders</h2>
              <span className="text-xs font-semibold text-gray-500">{orders.length} orders</span>
            </div>
            <input
              className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2"
              placeholder="Search by product or restaurant name"
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
            />

            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-600">
                No incoming orders yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                      <th className="p-3">Order</th>
                      <th className="p-3">Restaurant</th>
                      <th className="p-3">Product line</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="p-3 font-semibold">#{o.id}</td>
                        <td className="p-3">
                          <div className="font-semibold">{o.restaurant_name}</div>
                          <div className="text-xs text-gray-600">{o.restaurant_address}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold">{o.product_name}</div>
                          {(() => {
                            const meta = productMetaById.get(Number(o.product_id));
                            const unit = o.unit || meta?.unit || "piece";
                            const linePrice = o.price ?? meta?.price ?? 0;
                            return (
                              <div className="text-xs text-gray-600">
                                {formatQuantityUnit(o.quantity, unit)} x {formatPrice(linePrice)} ={" "}
                                <span className="font-semibold">
                                  {formatPrice(Number(o.quantity || 0) * Number(linePrice || 0))}
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="p-3">
                          <select
                            className="w-44 rounded-xl border border-gray-200 px-3 py-2"
                            value={o.status}
                            onChange={(e) => updateStatus(o.id, e.target.value)}
                          >
                            {STATUS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit product</h3>
              <button className="rounded-xl border px-3 py-1 text-sm" type="button" onClick={() => setEditing(null)}>
                Close
              </button>
            </div>
            <form onSubmit={updateProduct} className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Product name</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={editing.name || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Price (DZD)</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  type="number"
                  step="0.01"
                  value={editing.price || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, price: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={editing.description || ""}
                  onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  type="number"
                  min={0}
                  value={editing.quantity_available ?? 0}
                  onChange={(e) => setEditing((s) => ({ ...s, quantity_available: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Unit</label>
                <select
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2"
                  value={editing.unit || "piece"}
                  onChange={(e) => setEditing((s) => ({ ...s, unit: e.target.value }))}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <button className="w-full rounded-xl bg-livrili-greenDark py-2.5 font-semibold text-white hover:bg-livrili-greenMid" type="submit">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

