import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { hideLoader, showLoader } from "../../features/loader/loaderSlice";
import {
    FiTag, FiDollarSign, FiCheckSquare,
    FiPlus, FiX, FiSave, FiLock, FiTrendingUp, FiShoppingBag
} from "react-icons/fi";

const ALL_STATUSES = [
    "Lens Ordered",
    "Lens Received",
    "Lens Checked for Fitting",
    "Fitting Process",
    "Fitting Issue",
    "Fitting Done",
    "Fitting Checked",
    "Fitting QC Failed",
    "Ready To Deliver",
    "Delivered",
    "Holiday Closed",
    "Urgent Talk",
    "Delay Delivery",
    "Payment Delay",
];

const cardStyle = {
    background: "color-mix(in oklab, var(--card) 72%, transparent)",
    border: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
    backdropFilter: "blur(20px)",
    borderRadius: "1rem",
    overflow: "hidden",
};

const headerStyle = (accent) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
    background: accent
        ? "color-mix(in oklab, var(--primary) 12%, transparent)"
        : "color-mix(in oklab, var(--foreground) 4%, transparent)",
});

const iconBoxStyle = (accent) => ({
    width: "2rem",
    height: "2rem",
    borderRadius: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: accent
        ? "color-mix(in oklab, var(--primary) 22%, transparent)"
        : "color-mix(in oklab, var(--foreground) 8%, transparent)",
    border: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
});

const Section = ({ icon: Icon, title, description, children, accent = false }) => (
    <div style={cardStyle}>
        <div style={headerStyle(accent)}>
            <div style={iconBoxStyle(accent)}>
                <Icon size={15} style={{ color: accent ? "var(--primary)" : "var(--muted-foreground)" }} />
            </div>
            <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "0.05em" }}>{title}</p>
                {description && <p style={{ fontSize: "10px", color: "var(--muted-foreground)", marginTop: "2px" }}>{description}</p>}
            </div>
        </div>
        <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
);

function TagInput({ values, onChange, placeholder }) {
    const [input, setInput] = useState("");
    const [focused, setFocused] = useState(false);

    const add = () => {
        const v = input.trim().toUpperCase();
        if (v && !values.includes(v)) { onChange([...values, v]); setInput(""); }
    };

    const remove = (i) => onChange(values.filter((_, idx) => idx !== i));

    return (
        <div>
            <div
                style={{
                    minHeight: "44px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.375rem",
                    padding: "0.625rem",
                    borderRadius: "0.75rem",
                    border: focused
                        ? "1px solid var(--primary)"
                        : "1px solid color-mix(in oklab, var(--foreground) 12%, transparent)",
                    background: focused
                        ? "color-mix(in oklab, var(--primary) 8%, transparent)"
                        : "color-mix(in oklab, var(--foreground) 5%, transparent)",
                    boxShadow: focused ? "0 0 0 3px color-mix(in oklab, var(--primary) 18%, transparent)" : "none",
                    transition: "all 0.15s",
                    marginBottom: "0.75rem",
                }}
            >
                {values.length === 0 && !focused && (
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontStyle: "italic", alignSelf: "center", padding: "0 4px" }}>
                        Nothing added yet…
                    </span>
                )}
                {values.map((v, i) => (
                    <span
                        key={i}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            background: "color-mix(in oklab, var(--primary) 18%, transparent)",
                            border: "1px solid color-mix(in oklab, var(--primary) 38%, transparent)",
                            color: "var(--primary-glow)",
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 10px",
                            borderRadius: "0.5rem",
                        }}
                    >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
                        {v}
                        <button type="button" onClick={() => remove(i)}
                            style={{ color: "color-mix(in oklab, var(--primary-glow) 65%, transparent)", background: "none", border: "none", cursor: "pointer", marginLeft: "2px", padding: 0 }}>
                            <FiX size={10} />
                        </button>
                    </span>
                ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        fontSize: "12px",
                        borderRadius: "0.75rem",
                        border: "1px solid color-mix(in oklab, var(--foreground) 14%, transparent)",
                        background: "color-mix(in oklab, var(--foreground) 6%, transparent)",
                        color: "var(--foreground)",
                        outline: "none",
                    }}
                />
                <button
                    type="button"
                    onClick={add}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 1rem",
                        background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)",
                        color: "var(--primary-foreground)",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "0.75rem",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 2px 10px color-mix(in oklab, var(--primary) 40%, transparent)",
                        transition: "opacity 0.15s",
                    }}
                >
                    <FiPlus size={12} /> Add
                </button>
            </div>
        </div>
    );
}

function StatusGrid({ selected, onChange }) {
    const toggle = (s) =>
        selected.includes(s) ? onChange(selected.filter((x) => x !== s)) : onChange([...selected, s]);

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.5rem" }}>
            {ALL_STATUSES.map((s, i) => {
                const checked = selected.includes(s);
                return (
                    <label
                        key={i}
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            borderRadius: "0.75rem",
                            border: checked
                                ? "1px solid color-mix(in oklab, var(--primary) 45%, transparent)"
                                : "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
                            background: checked
                                ? "color-mix(in oklab, var(--primary) 14%, transparent)"
                                : "color-mix(in oklab, var(--foreground) 4%, transparent)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            userSelect: "none",
                        }}
                    >
                        <div style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "4px",
                            border: checked ? "2px solid var(--primary)" : "2px solid color-mix(in oklab, var(--foreground) 25%, transparent)",
                            background: checked ? "var(--primary)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: checked ? "0 2px 6px color-mix(in oklab, var(--primary) 40%, transparent)" : "none",
                            transition: "all 0.15s",
                        }}>
                            {checked && (
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(s)} />
                        <span style={{
                            fontSize: "11px",
                            fontWeight: 500,
                            lineHeight: 1.3,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            color: checked ? "var(--primary-glow)" : "var(--muted-foreground)",
                            transition: "color 0.15s",
                        }}>
                            {s}
                        </span>
                        {checked && (
                            <span style={{
                                position: "absolute",
                                right: "0.75rem",
                                top: "50%",
                                transform: "translateY(-50%)",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "var(--primary)",
                            }} />
                        )}
                    </label>
                );
            })}
        </div>
    );
}

function AccessDenied() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
            <div style={{ ...cardStyle, padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", maxWidth: "360px", width: "100%", textAlign: "center" }}>
                <div style={{
                    width: "56px", height: "56px", borderRadius: "1rem",
                    background: "color-mix(in oklab, var(--destructive) 16%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--destructive) 32%, transparent)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <FiLock size={22} style={{ color: "var(--destructive)" }} />
                </div>
                <div>
                    <h2 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--foreground)" }}>Access Denied</h2>
                    <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "0.375rem", lineHeight: 1.6 }}>
                        You don't have permission to view this page.<br />Contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}

const SaveBtn = ({ loading, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading}
        style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.25rem",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)",
            color: "var(--primary-foreground)",
            fontSize: "11px",
            fontWeight: 700,
            borderRadius: "0.75rem",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            boxShadow: "0 4px 16px color-mix(in oklab, var(--primary) 45%, transparent)",
            transition: "all 0.15s",
        }}
    >
        {loading
            ? <><div className="btn-spin" /> Saving…</>
            : <><FiSave size={13} /> Save Settings</>
        }
    </button>
);

export default function Settings() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [form, setForm] = useState({
        allCategories: [],
        paymentFor: [],
        salesPaymentFor: [],
        status: [],
    });

    if (user?.role !== "ADMIN") return <AccessDenied />;

    useEffect(() => {
        (async () => {
            try {
                dispatch(showLoader());
                const res = await api.get("/settings");
                const d = res.data.data;
                setForm({
                    allCategories:   d.allCategories   || [],
                    paymentFor:      d.paymentFor      || [],
                    salesPaymentFor: d.salesPaymentFor || [],
                    status:          d.status?.length ? d.status : ALL_STATUSES,
                });
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load settings");
            } finally {
                setFetching(false);
                dispatch(hideLoader());
            }
        })();
    }, []);

    const update = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

    const handleSave = async () => {
        try {
            setLoading(true);
            dispatch(showLoader());
            const res = await api.put("/settings", form);
            toast.success(res.data.message || "Settings updated successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update settings");
        } finally {
            setLoading(false);
            dispatch(hideLoader());
        }
    };

    if (fetching) return null;

    return (
        <div style={{ minHeight: "100vh" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                <Section icon={FiTag} title="Product Categories" description="Used across inventory, billing & reports" accent>
                    <TagInput
                        values={form.allCategories}
                        onChange={update("allCategories")}
                        placeholder="Type a category and press Enter…"
                    />
                </Section>

                <Section icon={FiDollarSign} title="Payment Types" description="Modes accepted at your store">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <FiShoppingBag size={10} style={{ color: "var(--primary)" }} /> Expense Modes
                            </p>
                            <TagInput
                                values={form.paymentFor}
                                onChange={update("paymentFor")}
                                placeholder="e.g. Cash, UPI, Bank Transfer…"
                            />
                        </div>
                        <div style={{ borderLeft: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)", paddingLeft: "1.5rem" }}>
                            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <FiTrendingUp size={10} style={{ color: "var(--primary)" }} /> Sales Modes
                            </p>
                            <TagInput
                                values={form.salesPaymentFor}
                                onChange={update("salesPaymentFor")}
                                placeholder="e.g. Card, EMI, BNPL…"
                            />
                        </div>
                    </div>
                </Section>

                <Section icon={FiCheckSquare} title="Order Statuses" description="Control order statuses" accent>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                background: "color-mix(in oklab, var(--primary) 14%, transparent)",
                                border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)",
                                borderRadius: "99px",
                                padding: "0 0.75rem",
                            }}>
                                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--primary)" }}>{form.status.length}</span>
                                <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>/ {ALL_STATUSES.length} active</span>
                            </div>
                            <div style={{ width: "96px", height: "6px", background: "color-mix(in oklab, var(--foreground) 10%, transparent)", borderRadius: "99px", overflow: "hidden" }}>
                                <div
                                    style={{
                                        height: "100%",
                                        background: "linear-gradient(to right, var(--primary), var(--primary-glow))",
                                        borderRadius: "99px",
                                        width: `${(form.status.length / ALL_STATUSES.length) * 100}%`,
                                        transition: "width 0.3s",
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button type="button" onClick={() => update("status")(ALL_STATUSES)}
                                style={{ fontSize: "10px", fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                                Select All
                            </button>
                            <button type="button" onClick={() => update("status")([])}
                                style={{ fontSize: "10px", fontWeight: 600, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                                Clear
                            </button>
                        </div>
                    </div>

                    <StatusGrid selected={form.status} onChange={update("status")} />
                </Section>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.5rem" }}>
                    <p style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>Changes apply immediately after saving.</p>
                    <SaveBtn loading={loading} onClick={handleSave} />
                </div>

            </div>
        </div>
    );
}
