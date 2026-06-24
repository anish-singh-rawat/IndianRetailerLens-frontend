import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Prescription from "../../components/Prescription";
import Select from "react-select";
import api from "../../utils/api";
import { FiTrash2, FiEye, FiImage, FiUser, FiCreditCard, FiPhone, FiMail, FiMapPin, FiFileText, FiPackage, FiLoader } from "react-icons/fi";
import Swal from "sweetalert2";
import { hideLoader, showLoader } from "../../features/loader/loaderSlice";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// ─── debounce helper ──────────────────────────────────────────────────────────
function useDebounce(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}


/* ───── IMAGE NORMALIZATION ───── */
const normalizeToJpeg = (file) =>
    new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX = 1024;
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            if (w > MAX || h > MAX) {
                if (w > h) { h = Math.round((h / w) * MAX); w = MAX; }
                else { w = Math.round((w / h) * MAX); h = MAX; }
            }
            canvas.width = w;
            canvas.height = h;
            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            canvas.toBlob(
                (blob) => {
                    resolve(new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" }));
                },
                "image/jpeg",
                0.6
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });




export default function NewJobCard() {

    const store = useSelector((state) => state.auth.store);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userId = store?.userId;
    const ownerName = store?.ownerName;
    const employees = useSelector((state) => state.employees.data);
    const settings = useSelector((state) => state.settings.data);
    const LOYALTY_POINT_VALUE = store?.valueOfloyaltyPoints || 0;

    /* -------------------- CUSTOMER -------------------- */
    const [customerData, setCustomerData] = useState({
        name: "", mobile: "", email: "", address: "", dob: "", anniversary: "",
        orderDate: new Date().toISOString().slice(0, 10),
    });

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [searching, setSearching] = useState(false);
    const [fetchingRx, setFetchingRx] = useState(false);
    const suggestionRef = useRef(null);
    const [mrpCapErrors, setMrpCapErrors] = useState({});

    const debouncedName = useDebounce(customerData.name, 350);
    const debouncedMobile = useDebounce(customerData.mobile, 350);

    useEffect(() => {
        const handler = (e) => {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target))
                setShowSuggestions(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (activeField === "name" && debouncedName.trim().length >= 3)
            fetchSuggestions(debouncedName.trim());
    }, [debouncedName]);

    useEffect(() => {
        if (activeField === "mobile" && debouncedMobile.trim().length >= 3)
            fetchSuggestions(debouncedMobile.trim());
    }, [debouncedMobile]);

    const fetchSuggestions = async (q) => {
        try {
            setSearching(true);
            const res = await api.get("/jc/search", { params: { q } });
            if (res.data.success) { setSuggestions(res.data.data || []); setShowSuggestions(true); }
        } catch (err) { console.error("Customer search error:", err); }
        finally { setSearching(false); }
    };

    const handleSelectCustomer = async (customer) => {
        setCustomerData((prev) => ({
            ...prev, _id: customer._id, custNumber: customer.custNumber,
            name: customer.name || "", mobile: customer.mobile || "",
            email: customer.email || "", address: customer.address || "",
            dob: customer.dob ? customer.dob.slice(0, 10) : "",
            anniversary: customer.anniversary ? customer.anniversary.slice(0, 10) : "",
        }));
        setPaymentDetails((prev) => ({ ...prev, loyaltyPoints: customer.loyalty_points || 0 }));
        setAvailableLoyaltyPoints(customer.loyalty_points || 0);
        setSuggestions([]); setShowSuggestions(false);
        if (customer.custNumber) await fetchLatestPrescription(customer.custNumber);
    };

    const initialRestPrescription = {
        powerRemark: "", frm: "", cor: "", a: "", b: "", dbl: "", afh: "",
        pd: "", r: "", l: "", ed: "", dia: "", sendMessage: "Yes",
        jcStatus: "Active", pstatus: "In-process"
    };


    // Fetch latest prescription after select suggestion
    const fetchLatestPrescription = async (custNumber) => {
        try {
            setFetchingRx(true);
            const res = await api.get(`/jc/${custNumber}/latest-prescription`);
            if (res.data.success && res.data.data) {
                const { contactLens, eyewear, transpose, restprescription } = res.data.data;

                // Pre-fill the first product's prescription
                const firstProductKey = products[0]?.key;
                if (firstProductKey) {
                    const existingRx = prescriptions.find(rx => rx.productKey === firstProductKey);
                    if (existingRx) {
                        // Update existing
                        updatePrescription(existingRx.id, { eyewear, transpose, contactLens });
                    } else {
                        // Add new one linked to first product
                        setPrescriptions(prev => [...prev, {
                            id: uuidv4(),
                            productKey: firstProductKey,
                            eyewear, transpose, contactLens,
                        }]);
                    }
                }

                if (restprescription) {
                    setRestPrescription({ ...restprescription, sendMessage: "Yes", jcStatus: "Active", pstatus: "In-process" });
                } else {
                    setRestPrescription(initialRestPrescription);
                }
            }
        } catch (err) {
            if (err?.response?.status !== 404) console.error("Fetch prescription error:", err);
        } finally { setFetchingRx(false); }
    };

    /* -------------------- BILL DETAILS -------------------- */
    const [billDetails, setBillDetails] = useState({
        billNo: "", deliveryDate: "", testedBy: "SELF", testedByName: ownerName || "",
        referredByType: "NONE", referName: "", referMobile: "",
    });

    /* -------------------- PRODUCTS -------------------- */
    const emptyProduct = {
        key: uuidv4(), productCode: "", scan: "", category: "", otherCategory: "",
        otherProductName: "", productName: null, lensAvailibility: "", vendorId: "",
        vendorName: "", price: 0, discount: 0, discountPercent: 0, quantity: 1, cost: 0,
        subtotal: 0, gstPercent: "0", gstMode: "CGST/SGST", cgst: 0, sgst: 0, igst: 0,
        gstAmount: 0, gstType: "EXCLUDED", total: 0, bookedBy: userId || "",
        bookedByName: ownerName || "", hsnSac: "", commissionPercent: 0,
        commissionAmount: 0, image: null, imageUrl: null,
        bogoGroupId: null,
        isFreeItem: false,
        coating: ""
    };


    /* ------------------------------------------------------------------ 
       BOGO HANDLER
    ------------------------------------------------------------------ */
    const handleApplyBogo = (index) => {
        const paidRow = products[index];
        const groupId = uuidv4();

        const updatedPaid = {
            ...paidRow,
            bogoGroupId: groupId,
            isFreeItem: false,
        };

        const freeRow = {
            ...emptyProduct,
            key: uuidv4(),
            bogoGroupId: groupId,
            isFreeItem: true,
            category: paidRow.category,
            productCode: paidRow.productCode,
            productName: paidRow.productName,
            otherProductName: paidRow.otherProductName,
            otherCategory: paidRow.otherCategory,
            coating: paidRow.coating || "",
            price: paidRow.price,
            cost: paidRow.cost,
            gstPercent: paidRow.gstPercent,
            gstMode: paidRow.gstMode,
            gstType: paidRow.gstType,
            hsnSac: paidRow.hsnSac,
            imageUrl: paidRow.imageUrl,
            quantity: paidRow.quantity,
            bookedBy: paidRow.bookedBy,
            bookedByName: paidRow.bookedByName,
            discount: paidRow.price,
            discountPercent: 100,
            subtotal: 0,
            gstAmount: 0,
            cgst: 0, sgst: 0, igst: 0,
            total: 0,
            commissionAmount: 0,
            commissionPercent: 0,
        };

        const updated = [...products];
        updated[index] = updatedPaid;
        updated.splice(index + 1, 0, freeRow);
        setProducts(updated);

        setProductOptions((prev) => ({
            ...prev,
            [index + 1]: prev[index] || [],
        }));

    };

    const [products, setProducts] = useState([emptyProduct]);
    const [categoryProducts, setCategoryProducts] = useState({});
    const [productOptions, setProductOptions] = useState({});
    const [vendors, setVendors] = useState([]);
    const [scanLoading, setScanLoading] = useState({});

    const fetchAllVendors = async () => {
        try {
            const res = await api.get("/vendor");
            if (res.data.success) setVendors(res.data.vendors);
        } catch (err) { console.error("Failed to fetch vendors", err); }
    };

    useEffect(() => { fetchAllVendors(); }, []);

    /* -------------------- PAYMENT -------------------- */
    const [availableLoyaltyPoints, setAvailableLoyaltyPoints] = useState(0);
    const [paymentDetails, setPaymentDetails] = useState({
        loyaltyPoints: 0, subTotal: 0, grossTotal: 0, total: 0,
        additionalDiscount: 0, advance: 0, loyaltyDiscount: 0,
        balance: 0, transactionType: "", remark: "",
    });

    /* -------------------- PRESCRIPTION -------------------- */
    const [prescriptions, setPrescriptions] = useState([]);


    const emptyEye = {
        sph: "", cyl: "", axis: "", vis: "",
        nv_sph: "", nv_cyl: "", nv_axis: "", nv_vis: "", add: ""
    };

    const emptyPrescription = (productKey) => ({
        id: uuidv4(),
        productKey,
        eyewear: { rightEye: { ...emptyEye }, leftEye: { ...emptyEye } },
        transpose: { rightEye: { ...emptyEye }, leftEye: { ...emptyEye } },
        contactLens: { rightEye: { ...emptyEye }, leftEye: { ...emptyEye } },
    });

    const addPrescriptionForProduct = (productKey) => {
        // Only one Rx per product
        if (prescriptions.find(rx => rx.productKey === productKey)) return;
        setPrescriptions(prev => [...prev, emptyPrescription(productKey)]);
    };

    const removePrescription = (rxId) => {
        setPrescriptions(prev => prev.filter(rx => rx.id !== rxId));
    };

    const updatePrescription = (rxId, updaterOrValue) => {
        setPrescriptions(prev =>
            prev.map(rx => {
                if (rx.id !== rxId) return rx;

                // Support both functional updater and plain object
                if (typeof updaterOrValue === "function") {
                    // Child called setPrescription(prev => newValue)
                    // Build the "prev" shape the child expects
                    const prevShape = {
                        eyewear: rx.eyewear,
                        transpose: rx.transpose,
                        contactLens: rx.contactLens,
                    };
                    const result = updaterOrValue(prevShape);
                    return {
                        ...rx,
                        eyewear: result.eyewear ?? rx.eyewear,
                        contactLens: result.contactLens ?? rx.contactLens,
                        transpose: result.transpose ?? rx.transpose,
                    };
                }

                // Plain object update
                return {
                    ...rx,
                    eyewear: updaterOrValue.eyewear ?? rx.eyewear,
                    contactLens: updaterOrValue.contactLens ?? rx.contactLens,
                    transpose: updaterOrValue.transpose ?? rx.transpose,
                };
            })
        );
    };

    const [restPrescription, setRestPrescription] = useState({
        powerRemark: "", frm: "", cor: "", a: "", b: "", dbl: "", afh: "",
        pd: "", r: "", l: "", ed: "", dia: "", sendMessage: "Yes",
        jcStatus: "Active", pstatus: "In-process",
    });


    // runs only once on initial load - add prescription section
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        const firstKey = products[0]?.key;
        if (firstKey) {
            setPrescriptions([emptyPrescription(firstKey)]);
        }
    }, []);

    /* -------------------- SCAN HANDLER -------------------- */
    const handleScan = async (index, productCode) => {
        const code = productCode.trim();
        if (!code || code.length < 3) return;

        setScanLoading((prev) => ({ ...prev, [index]: true }));

        try {
            const res = await api.get(`/jc/product/scan/${code}`);
            console.log("SCAN response ===> ", res);

            if (!res.data.success) {
                toast && toast.error(`Product "${code}" not found.`);
                return;
            }

            const { scannedProduct, category, categoryProducts: catProds } = res.data.data;

            let cachedProds = categoryProducts[category];
            if (!cachedProds) {
                setCategoryProducts((prev) => ({ ...prev, [category]: catProds }));
                cachedProds = catProds;
            }

            const options = buildProductOptions(cachedProds);
            setProductOptions((prev) => ({ ...prev, [index]: options }));

            setProducts((prev) => {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    scan: code,
                    productCode: scannedProduct.productCode || code,
                    category: category,
                    productName: scannedProduct.productName || "",
                    coating: scannedProduct.coating || "",
                    price: scannedProduct.mrp || 0,
                    cost: scannedProduct.price || 0,
                    gstPercent: String(scannedProduct.gst || "0"),
                    hsnSac: scannedProduct.hsnSac || "",
                    imageUrl: scannedProduct.image || null,
                    image: null,
                    quantity: 1,
                    discount: 0,
                    discountPercent: 0,
                };

                return updated;
            });

            setTimeout(() => calculateProductTotals(index, ""), 0);

        } catch (err) {
            if (err?.response?.status === 404) {
                Swal.fire({
                    icon: "warning", title: "Product Not Found",
                    text: `No product found with code "${code}".`,
                    confirmButtonColor: "#F26522", timer: 2500, showConfirmButton: false,
                });
            } else {
                console.error("Scan error:", err);
                Swal.fire({ icon: "error", title: "Scan Failed", text: "Could not fetch product. Try again.", confirmButtonColor: "#dc2626" });
            }
        } finally {
            setScanLoading((prev) => ({ ...prev, [index]: false }));
        }
    };

    /* -------------------- PRODUCT HANDLERS -------------------- */
    const handleProductChange = async (index, field, value) => {
        const updated = [...products];

        if (field === "category") {
            updated[index] = {
                ...updated[index],
                ...emptyProduct,
                key: updated[index].key,
                category: value,
                coating: updated[index].coating || "",
                bogoGroupId: updated[index].bogoGroupId,
                isFreeItem: updated[index].isFreeItem,
            };
            setProducts(updated);
            setProductOptions((prev) => ({ ...prev, [index]: [] }));

            if (categoryProducts[value]) {
                setProductOptions((prev) => ({ ...prev, [index]: buildProductOptions(categoryProducts[value]) }));
                console.log(categoryProducts[value])
                return;
            }

            try {
                if (value !== "OTHER") {
                    const res = await api.get(`/product/category/${value}`);
                    if (res.data.success) {
                        const prods = res.data.data || [];
                        setCategoryProducts((prev) => ({ ...prev, [value]: prods }));
                        setProductOptions((prev) => ({ ...prev, [index]: buildProductOptions(prods) }));
                    }
                }
            } catch (error) { console.error("Failed to fetch category products:", error); }
            return;
        }

        if (field === "bookedBy") {
            const selectedEmployee = employees.find(emp => emp._id === value);
            updated[index] = { ...updated[index], bookedBy: value, bookedByName: selectedEmployee?.name || "" };
            setProducts(updated);
            setTimeout(() => calculateProductTotals(index), 0);
            return;
        }

        // When quantity changes on a PAID row, mirror to the free row
        if (field === "quantity" && updated[index].bogoGroupId && !updated[index].isFreeItem) {
            updated[index] = { ...updated[index], quantity: value };
            setProducts(updated);
            calculateProductTotals(index, "");


            // Mirror quantity to free row
            setProducts((prev) => {
                const next = [...prev];
                const freeIdx = next.findIndex(
                    (r) => r.bogoGroupId === updated[index].bogoGroupId && r.isFreeItem
                );
                if (freeIdx !== -1) {
                    next[freeIdx] = { ...next[freeIdx], quantity: value };

                }
                return next;
            });

            setTimeout(() => {
                setProducts((prev) => {
                    const freeIdx = prev.findIndex(
                        (r) => r.bogoGroupId === updated[index].bogoGroupId && r.isFreeItem
                    );
                    if (freeIdx !== -1) calculateProductTotals(freeIdx, "");
                    return prev;
                });
            }, 0);
            return;
        }

        // Quantity change on non-BOGO row — trigger stock check
        if (field === "quantity" && updated[index].productCode) {
            updated[index] = { ...updated[index], quantity: value };
            setProducts(updated);
            calculateProductTotals(index, "");
            return;
        }

        updated[index] = { ...updated[index], [field]: value };
        setProducts(updated);

        if (field === "discount") calculateProductTotals(index, "discount");
        else if (field === "discountPercent") calculateProductTotals(index, "discountPercent");
        else calculateProductTotals(index, "");
    };

    const addProductRow = () => setProducts([...products, { ...emptyProduct, key: uuidv4() }]);

    const removeRow = (key) => {
        if (products.length === 1) return;

        const target = products.find((p) => p.key === key);


        setProducts((prev) => {
            if (!target?.bogoGroupId) {
                return prev.filter((r) => r.key !== key);
            }

            if (!target.isFreeItem) {
                return prev.filter((r) => r.bogoGroupId !== target.bogoGroupId);
            }

            return prev
                .filter((r) => r.key !== key)
                .map((r) =>
                    r.bogoGroupId === target.bogoGroupId
                        ? { ...r, bogoGroupId: null, isFreeItem: false }
                        : r
                );
        });


        // Remove linked prescription when product is deleted
        setPrescriptions(prev => prev.filter(rx => rx.productKey !== key));

        setMrpCapErrors(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };


    const getAvailableQty = (productCode, category) => {
        if (!productCode || !category) return null;


        const prods = categoryProducts[category] || [];
        const found = prods.find(p => p.productCode === productCode);

        console.log("Checking stock for:", productCode, category);
        console.log("Available products:", prods);
        console.log("Matched product:", found);

        // return found ? Number(found.quantity || 0) : null;
        return found ? Number(found.quantity ?? found.qty ?? found.stock ?? 0) : null;
    };

    const buildProductOptions = (prods) =>
        prods.map((p) => ({
            value: p.productName, label: p.productName,
            productCode: p.productCode, cost: p.price, price: p.mrp,
            gstPercent: p.gst, hsnSac: p.hsnSac, imageUrl: p.image,
            coating: p.coating
        }));

    const round2 = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const calculateProductTotals = (index, lastChanged) => {
        setProducts((prev) => {
            const r2 = (n) => Math.round(n * 100) / 100;
            const updated = [...prev];
            const product = { ...updated[index] };

            // BOGO guard: free items are always ₹0
            if (product.isFreeItem) {
                const price = Number(product.price || 0);
                updated[index] = {
                    ...product,
                    discount: price,
                    discountPercent: 100,
                    subtotal: 0,
                    gstAmount: 0,
                    cgst: 0, sgst: 0, igst: 0,
                    total: 0,
                    commissionAmount: 0,
                    commissionPercent: 0,
                };
                return updated;
            }

            const price = Number(product.price || 0);
            const quantity = Number(product.quantity || 1);
            const gstPercent = Number(product.gstPercent || 0);
            const gstMode = product.gstMode;
            const baseAmount = price * quantity;

            let discount = Number(product.discount || 0);
            let discountPercent = Number(product.discountPercent || 0);

            if (lastChanged === "discount" && baseAmount > 0) discountPercent = (discount / baseAmount) * 100;
            if (lastChanged === "discountPercent" && baseAmount > 0) discount = (baseAmount * discountPercent) / 100;

            discount = Math.min(discount, baseAmount);
            discountPercent = Math.min(discountPercent, 100);

            let subtotal = baseAmount - discount;
            let gstAmount = product.gstType === "INCLUDED"
                ? subtotal - subtotal * (100 / (100 + gstPercent))
                : (subtotal * gstPercent) / 100;

            let cgst = 0, sgst = 0, igst = 0;
            if (gstMode === "CGST/SGST") { cgst = r2(gstAmount / 2); sgst = r2(gstAmount / 2); }
            else igst = gstAmount;

            let total = product.gstType === "INCLUDED" ? subtotal : subtotal + gstAmount;

            let commissionAmount = 0, commissionPercent = 0;
            if (product.bookedBy) {
                const employee = employees.find(emp => emp._id === product.bookedBy);
                commissionPercent = Number(employee?.commission || 0);
                commissionAmount = (subtotal * commissionPercent) / 100;
            }

            updated[index] = {
                ...product,
                discount: r2(discount), discountPercent: r2(discountPercent),
                subtotal: r2(subtotal), gstAmount: r2(gstAmount),
                cgst, sgst, igst, total: r2(total),
                commissionPercent: r2(commissionPercent),
                commissionAmount: r2(commissionAmount),
            };
            return updated;
        });
    };

    const calculateTotalsFromProducts = (prods) => {
        let subTotal = 0, grossTotal = 0;
        prods.forEach((p) => { subTotal += Number(p.subtotal || 0); grossTotal += Number(p.total || 0); });
        return { subTotal: round2(subTotal), total: round2(grossTotal) };
    };

    useEffect(() => {
        const { subTotal, total } = calculateTotalsFromProducts(products);
        setPaymentDetails((prev) => recalcPayment({ ...prev, subTotal, total }));
    }, [products]);

    const handlePaymentChange = (field, value) => {
        setPaymentDetails((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        setPaymentDetails((prev) => recalcPayment(prev));
    }, [
        paymentDetails.additionalDiscount,
        paymentDetails.advance,
        paymentDetails.loyaltyPoints,
        paymentDetails.total
    ]);

    const recalcPayment = (prev) => {
        const total = Number(prev.total || 0);

        let loyaltyPoints = Number(prev.loyaltyPoints || 0);
        let loyaltyDiscount = loyaltyPoints * LOYALTY_POINT_VALUE;

        let additionalDiscount = Number(prev.additionalDiscount || 0);
        let advance = Number(prev.advance || 0);

        loyaltyDiscount = Math.min(loyaltyDiscount, total);
        loyaltyPoints = Math.floor(loyaltyDiscount / LOYALTY_POINT_VALUE);

        const afterLoyalty = total - loyaltyDiscount;
        additionalDiscount = Math.min(additionalDiscount, afterLoyalty);
        const afterDiscounts = afterLoyalty - additionalDiscount;

        advance = Math.min(advance, afterDiscounts);

        const balance = Math.max(
            total - loyaltyDiscount - additionalDiscount - advance,
            0
        );

        if (prev.balance === balance && prev.loyaltyDiscount === loyaltyDiscount) {
            return prev;
        }

        return { ...prev, loyaltyPoints, loyaltyDiscount, additionalDiscount, advance, balance };
    };


    /* -------------------- VALIDATION & SUBMIT -------------------- */
    const validateForm = () => {
        if (!customerData.name.trim()) return "Customer name is required";
        const mobile = customerData.mobile.trim();
        if (!mobile) return "Customer mobile is required";
        if (!/^[6-9]\d{9}$/.test(mobile)) return "Enter a valid 10-digit mobile number";
        if (!billDetails.deliveryDate) return "Delivery date is required";
        if (billDetails.testedBy === "SELF" && !billDetails.testedByName.trim()) return "Tested by name is required";
        if (billDetails.testedBy === "OUTSIDE" && !billDetails.testedByName.trim()) return "Doctor/Shop name is required";

        for (let i = 0; i < products.length; i++) {
            const p = products[i], row = i + 1;
            if (!p.category) return `Product row ${row}: Category is required`;
            if (p.category === "OTHER" && !p.otherCategory.trim()) return `Product row ${row}: Other category is required`;
            if (p.category === "OTHER" && !p.otherProductName) return `Product row ${row}: Product name is required`;
            if (Number(p.quantity) <= 0) return `Product row ${row}: Quantity must be greater than 0`;
            if (!p.isFreeItem && Number(p.price) <= 0) return `Product row ${row}: Price must be greater than 0`;
            if (!p.bookedBy) return `Product row ${row}: Booked By is required`;
            if (["LENS", "GLASS"].includes(p.category) && !p.lensAvailibility) return `Product row ${row}: Lens availability is required`;
            if (p.lensAvailibility === "ORDER" && !p.vendorName.trim()) return `Product row ${row}: Order To Whom is required`;

            const availableQty = getAvailableQty(p.productCode, p.category);

            if (p.productCode && availableQty !== null && Number(p.quantity) > availableQty) {
                return `Product row ${row} "${p.productName || p.productCode}": Only ${availableQty} available, but ${p.quantity} requested.`;
            }
        }

        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            if (mrpCapErrors[p.key]) {
                return `Product row ${i + 1}: Free item MRP exceeds paid product price.`;
            }
        }

        if (!paymentDetails.transactionType) return "Transaction type is required";
        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) { Swal.fire({ icon: "error", title: "Validation Error", text: error, confirmButtonColor: "#16a34a" }); return; }

        try {
            dispatch(showLoader());
            const formData = new FormData();
            formData.append("customerData", JSON.stringify(customerData));
            formData.append("billDetails", JSON.stringify(billDetails));
            formData.append("paymentDetails", JSON.stringify(paymentDetails));
            formData.append("prescriptions", JSON.stringify(prescriptions));
            formData.append("restPrescription", JSON.stringify(restPrescription));
            formData.append("products", JSON.stringify(products));
            products.forEach((product, index) => {
                if (product.image instanceof File) formData.append(`productImage_${index}`, product.image);
            });

            // console.log("customer data => ", customerData);
            // console.log("billDetails data => ", billDetails);
            // console.log("paymentDetails data => ", paymentDetails);
            // console.log("prescriptions data => ", prescriptions);
            // console.log("restPrescription data => ", restPrescription);
            // console.log("products data => ", products);

            const { data } = await api.post("jc/submit", formData, { headers: { "Content-Type": "multipart/form-data" } });
            if (data.success) {
                toast.success(`Job Card Created Successfully`, { duration: 2000 });
                resetForm();
                setTimeout(() => { navigate("/jc/list"); }, 2000);
            }

        } catch (err) {
            Swal.fire({ icon: "error", title: "Submission Failed", text: err.response?.data?.message || err.message, confirmButtonColor: "#dc2626" });
        } finally { dispatch(hideLoader()); }
    };

    const resetForm = () => {

        const newKey = uuidv4();

        setCustomerData({ name: "", mobile: "", email: "", address: "", dob: "", anniversary: "", orderDate: new Date().toISOString().slice(0, 10) });
        setBillDetails({ billNo: "", deliveryDate: "", testedBy: "SELF", testedByName: "", referredByType: "NONE", referName: "", referMobile: "" });
        setProducts([{ ...emptyProduct, key: uuidv4() }]);
        setPaymentDetails({ loyaltyPoints: 0, subTotal: 0, grossTotal: 0, total: 0, additionalDiscount: 0, advance: 0, loyaltyDiscount: 0, balance: 0, transactionType: "", remark: "" });

        setPrescriptions([emptyPrescription(newKey)]);   // ← seed fresh one
        hasInitialized.current = false;                  // ← allow re-init if needed
        setRestPrescription(initialRestPrescription);
        setSuggestions([]); setShowSuggestions(false); setScanLoading({});
    };

    /* -------------------- STYLES -------------------- */
    const inputCls = "w-full pl-9 pr-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-orange-300 transition-all placeholder-gray-400";
    const dateCls = "w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-orange-300 transition-all cursor-pointer";
    const labelCls = "block text-xs font-medium text-gray-600 mb-1.5";
    const selectCls = "w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-orange-300 transition-all cursor-pointer";
    const disabledInputCls = "w-full px-3 py-2.5 text-sm text-gray-400 bg-gray-100 border border-gray-200 rounded-lg outline-none cursor-not-allowed opacity-70";

    /* -------------------- UI -------------------- */
    return (
        <div className="p-4 bg-white rounded-xl shadow space-y-8">

            {fetchingRx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl px-8 py-6 shadow-xl flex items-center gap-3">
                        <FiLoader size={20} className="animate-spin text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Loading latest prescription…</span>
                    </div>
                </div>
            )}

            {/* ================= CUSTOMER ================= */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <FiUser className="text-orange-400 text-xl" />
                    <h2 className="text-base font-bold text-gray-800">Customer Details</h2>
                </div>
                <div className="border-t border-gray-100 mb-5" />

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">

                    <div className="relative" ref={activeField === "name" ? suggestionRef : null}>
                        <label className={labelCls}>Name <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {searching && activeField === "name"
                                    ? <FiLoader size={15} className="animate-spin text-orange-400" />
                                    : <FiUser size={15} />}
                            </span>
                            <input type="text" placeholder="Customer name" value={customerData.name} autoComplete="off"
                                onFocus={() => setActiveField("name")}
                                onChange={(e) => {
                                    setActiveField("name");
                                    setCustomerData({ ...customerData, name: e.target.value });
                                    if (e.target.value.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); }
                                }}
                                className={inputCls} />
                        </div>
                        {showSuggestions && activeField === "name" && suggestions.length > 0 && (
                            <SuggestionDropdown suggestions={suggestions} onSelect={handleSelectCustomer} onClose={() => setShowSuggestions(false)} />
                        )}
                    </div>

                    <div className="relative" ref={activeField === "mobile" ? suggestionRef : null}>
                        <label className={labelCls}>Mobile <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {searching && activeField === "mobile"
                                    ? <FiLoader size={15} className="animate-spin text-orange-400" />
                                    : <FiPhone size={15} />}
                            </span>
                            <input type="tel" placeholder="10-digit mobile" value={customerData.mobile} autoComplete="off"
                                onFocus={() => setActiveField("mobile")}
                                onChange={(e) => {
                                    setActiveField("mobile");
                                    setCustomerData({ ...customerData, mobile: e.target.value });
                                    if (e.target.value.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); }
                                }}
                                className={inputCls} />
                        </div>
                        {showSuggestions && activeField === "mobile" && suggestions.length > 0 && (
                            <SuggestionDropdown suggestions={suggestions} onSelect={handleSelectCustomer} onClose={() => setShowSuggestions(false)} />
                        )}
                    </div>

                    <div>
                        <label className={labelCls}>Email</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiMail size={15} /></span>
                            <input type="email" placeholder="Email address" value={customerData.email}
                                onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })} className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Address</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiMapPin size={15} /></span>
                            <input type="text" placeholder="Address" value={customerData.address}
                                onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })} className={inputCls} />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Date of Birth</label>
                        <input type="date" value={customerData.dob}
                            onChange={(e) => setCustomerData({ ...customerData, dob: e.target.value })} className={dateCls} />
                    </div>

                    <div>
                        <label className={labelCls}>Anniversary</label>
                        <input type="date" value={customerData.anniversary}
                            onChange={(e) => setCustomerData({ ...customerData, anniversary: e.target.value })} className={dateCls} />
                    </div>

                    <div>
                        <label className={labelCls}>Order Date</label>
                        <input type="date" value={customerData.orderDate}
                            onChange={(e) => setCustomerData({ ...customerData, orderDate: e.target.value })} className={dateCls} />
                    </div>
                </div>
            </section>

            {/* ================= BILL DETAILS ================= */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <FiFileText className="text-xl text-orange-400" />
                    <h2 className="text-base font-bold text-gray-800">Bill Details</h2>
                </div>
                <div className="border-t border-gray-100 mb-5" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className={labelCls}>Bill No.</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FiCreditCard size={15} /></span>
                            <input type="text" placeholder="Bill No." value={billDetails.billNo}
                                onChange={(e) => setBillDetails({ ...billDetails, billNo: e.target.value })} className={inputCls} />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Delivery Date <span className="text-red-500">*</span></label>
                        <input type="date" value={billDetails.deliveryDate}
                            onChange={(e) => setBillDetails({ ...billDetails, deliveryDate: e.target.value })} className={dateCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Tested By <span className="text-red-500">*</span></label>
                        <select value={billDetails.testedBy}
                            onChange={(e) => setBillDetails((prev) => ({ ...prev, testedBy: e.target.value, testedByName: "" }))}
                            className={selectCls}>
                            <option value="SELF">Self</option>
                            <option value="OUTSIDE">Outside</option>
                        </select>
                    </div>
                    <div>
                        {billDetails.testedBy === "SELF" ? (
                            <>
                                <label className={labelCls}>Employee <span className="text-red-500">*</span></label>
                                <select value={billDetails.testedByName}
                                    onChange={(e) => setBillDetails((prev) => ({ ...prev, testedByName: e.target.value }))} className={selectCls}>
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => <option key={emp._id} value={emp.name}>{emp.name}</option>)}
                                </select>
                            </>
                        ) : (
                            <>
                                <label className={labelCls}>Doctor / Shop Name <span className="text-red-500">*</span></label>
                                <input type="text" placeholder="Doctor name" value={billDetails.testedByName}
                                    onChange={(e) => setBillDetails((prev) => ({ ...prev, testedByName: e.target.value }))} className={inputCls} />
                            </>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className={labelCls}>Referred By</label>
                        <select value={billDetails.referredByType}
                            onChange={(e) => { const value = e.target.value; setBillDetails((prev) => ({ ...prev, referredByType: value, ...(value === "NONE" ? { referName: "", referMobile: "" } : {}) })); }}
                            className={selectCls}>
                            <option value="NONE">None</option>
                            <option value="CUSTOMER">Customer</option>
                            <option value="DOCTOR">Doctor</option>
                        </select>
                    </div>
                    {billDetails.referredByType !== "NONE" && (
                        <>
                            <div>
                                <label className={labelCls}>Refer Name</label>
                                <input type="text" placeholder="Refer Name" value={billDetails.referName}
                                    onChange={(e) => setBillDetails({ ...billDetails, referName: e.target.value })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Refer Mobile</label>
                                <input type="tel" placeholder="Refer Mobile" value={billDetails.referMobile}
                                    onChange={(e) => setBillDetails({ ...billDetails, referMobile: e.target.value })} className={inputCls} />
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ================= PRODUCTS ================= */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <FiPackage className="text-xl text-orange-400" />
                    <h2 className="text-base font-bold text-gray-800">Products</h2>
                </div>
                <div className="border-t border-gray-100 mb-5" />

                {products.map((p, index) => (
                    <div
                        key={p.key}
                        className={`rounded-xl p-5 mb-1 ${p.isFreeItem
                            ? "border border-teal-200 bg-teal-50/40"
                            : p.bogoGroupId
                                ? "border border-green-200 bg-white"
                                : "border border-orange-100 bg-white"
                            }`}
                    >
                        {/* ── Row header ── */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                                    Product #{index + 1}
                                </span>
                                {p.isFreeItem && (
                                    <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-300 px-3 py-1 rounded-full">
                                        🎁 FREE (BOGO)
                                    </span>
                                )}
                                {p.bogoGroupId && !p.isFreeItem && (
                                    <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-300 px-3 py-1 rounded-full">
                                        BOGO Applied ✓
                                    </span>
                                )}


                                {/* Rx badge if a prescription exists for this product */}
                                {prescriptions.find(rx => rx.productKey === p.key) && (
                                    <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-300 px-3 py-1 rounded-full">
                                        Rx linked ✓
                                    </span>
                                )}

                            </div>

                            <div className="flex items-center gap-2">
                                {!p.bogoGroupId && !p.isFreeItem && p.productName && (
                                    <button
                                        type="button"
                                        onClick={() => handleApplyBogo(index)}
                                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
                                    >
                                        🎁 Apply BOGO
                                    </button>
                                )}
                                {p.bogoGroupId && !p.isFreeItem && (
                                    <button
                                        type="button"
                                        disabled
                                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 cursor-default"
                                    >
                                        BOGO Applied ✓
                                    </button>
                                )}
                                {products.length > 1 && (
                                    <button type="button" onClick={() => removeRow(p.key)}
                                        className="p-2 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition">
                                        <FiTrash2 size={16} />
                                    </button>
                                )}


                                {/* + Rx button — only on non-free items */}
                                {
                                    prescriptions.find(rx => rx.productKey === p.key)
                                        ?
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const rx = prescriptions.find(r => r.productKey === p.key);
                                                document.getElementById(`rx-${rx.id}`)?.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                                        >
                                            View Rx ↓
                                        </button>
                                        :
                                        <button
                                            type="button"
                                            onClick={() => addPrescriptionForProduct(p.key)}
                                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
                                        >
                                            + Add Rx
                                        </button>
                                }
                            </div>
                        </div>

                        <input type="hidden" value={p.productCode} />

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">

                            {/* Scan */}
                            <div>
                                <label htmlFor={`scan-${index}`} className={labelCls}>Scan</label>
                                <div className="relative">
                                    {scanLoading[index] && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400">
                                            <FiLoader size={14} className="animate-spin" />
                                        </span>
                                    )}
                                    {!scanLoading[index] && p.productName && p.scan && (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-bold">✓</span>
                                    )}
                                    <input
                                        id={`scan-${index}`}
                                        type="text" placeholder="Scan barcode"
                                        value={p.scan ?? ""}
                                        onChange={(e) => handleProductChange(index, "scan", e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScan(index, e.target.value); } }}
                                        onBlur={(e) => { if (e.target.value.trim()) handleScan(index, e.target.value); }}
                                        className={`${inputCls} pr-8`}
                                        disabled={scanLoading[index] || p.isFreeItem}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">Press Enter or blur to search</p>
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor={`categorySelect-${index}`} className={labelCls}>Category <span className="text-red-500">*</span></label>
                                <select
                                    id={`categorySelect-${index}`}
                                    value={p.category}
                                    onChange={(e) => handleProductChange(index, "category", e.target.value)}
                                    // disabled={p.isFreeItem}
                                    // className={p.isFreeItem ? disabledInputCls : selectCls}
                                    className={selectCls}
                                >
                                    <option value="">Select</option>
                                    {settings
                                        ? settings?.allCategories?.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)
                                        : <option value="OTHER">OTHER</option>}
                                </select>
                            </div>

                            {p.category === "OTHER" && (
                                <div>
                                    <label htmlFor={`categoryInput-${index}`} className={labelCls}>Other Category <span className="text-red-500">*</span></label>
                                    <input id={`categoryInput-${index}`} type="text" placeholder="Category" value={p.otherCategory}
                                        onChange={(e) => handleProductChange(index, "otherCategory", e.target.value)}
                                        disabled={p.isFreeItem}
                                        className={p.isFreeItem ? disabledInputCls : inputCls} />
                                </div>
                            )}

                            {/* Product Name */}
                            <div>
                                <label htmlFor={`productNameSelect-${index}`} className={labelCls}>
                                    Product Name <span className="text-red-500">*</span>
                                    {/* Hint for free row that price will be capped */}
                                    {p.isFreeItem && (
                                        <span className="ml-1 text-teal-500 font-normal">(price capped)</span>
                                    )}
                                </label>
                                {p.category === "OTHER" ? (
                                    <input id={`productNameInput-${index}`} type="text" placeholder="Product Name" value={p.otherProductName}
                                        onChange={(e) => handleProductChange(index, "otherProductName", e.target.value)}
                                        disabled={p.isFreeItem}
                                        className={p.isFreeItem ? disabledInputCls : inputCls} />
                                ) : (
                                    <Select
                                        inputId={`productNameSelect-${index}`}
                                        options={productOptions[index] || []}
                                        isSearchable
                                        // FREE rows: product name IS editable — price will be capped
                                        isDisabled={false}
                                        placeholder="Select"
                                        value={productOptions[index]?.find((opt) => opt.value === p.productName) || null}
                                        onChange={(selected) => {
                                            if (p.isFreeItem) {
                                                // --- FREE ROW: allow name change, cap price to paid row's price ---
                                                const paidRow = products.find(
                                                    (r) => r.bogoGroupId === p.bogoGroupId && !r.isFreeItem
                                                );
                                                const maxPrice = Number(paidRow?.price || 0);
                                                const rawPrice = Number(selected.price || 0);
                                                const cappedPrice = Math.min(rawPrice, maxPrice);

                                                setMrpCapErrors(prev => ({
                                                    ...prev,
                                                    [p.key]: rawPrice > maxPrice
                                                }));

                                                if (rawPrice > maxPrice) {
                                                    toast?.error(`Free item price capped at ₹${maxPrice}`);
                                                }

                                                const updated = [...products];
                                                updated[index] = {
                                                    ...updated[index],
                                                    productCode: selected.productCode,
                                                    productName: selected.value,
                                                    coating: selected.coating || "",
                                                    price: cappedPrice,
                                                    cost: selected.cost,
                                                    gstPercent: selected.gstPercent,
                                                    hsnSac: selected.hsnSac,
                                                    imageUrl: selected.imageUrl || null,
                                                    image: null,
                                                };
                                                setProducts(updated);
                                                setTimeout(() => calculateProductTotals(index, ""), 0);
                                                return;
                                            }

                                            // --- PAID ROW: unchanged logic ---
                                            const updated = [...products];
                                            updated[index] = {
                                                ...updated[index],
                                                productCode: selected.productCode,
                                                productName: selected.value,
                                                coating: selected.coating || "",
                                                price: selected.price,
                                                quantity: 1,
                                                cost: selected.cost,
                                                gstPercent: selected.gstPercent,
                                                hsnSac: selected.hsnSac,
                                                imageUrl: selected.imageUrl || null,
                                                image: null,
                                            };
                                            setProducts(updated);
                                            setTimeout(() => calculateProductTotals(index), 0);
                                        }}
                                        noOptionsMessage={() => products[index].category ? "No products found" : "Select category first"}
                                        styles={{
                                            control: (base) => ({
                                                ...base, borderColor: "#e5e7eb", borderRadius: "0.5rem",
                                                minHeight: "38px", fontSize: "0.875rem",
                                                // Free row gets a teal tint instead of gray to show it's editable
                                                backgroundColor: p.isFreeItem ? "#f0fdfa" : "#fff",
                                                boxShadow: "none",
                                                "&:hover": { borderColor: p.isFreeItem ? "#5eead4" : "#fdba74" }
                                            }),
                                            indicatorSeparator: () => ({ display: "none" }),
                                        }}
                                    />



                                )}

                                {/* Warn if selected free product's raw price was capped */}
                                {p.isFreeItem && (() => {
                                    const paidRow = products.find(
                                        (r) => r.bogoGroupId === p.bogoGroupId && !r.isFreeItem
                                    );
                                    const selectedOpt = productOptions[index]?.find((opt) => opt.value === p.productName);
                                    if (selectedOpt && paidRow && Number(selectedOpt.price) > Number(paidRow.price)) {
                                        return (
                                            <p className="text-[10px] text-amber-600 mt-0.5">
                                                ❌ Free item MRP (₹{selectedOpt.price}) exceeds paid item (₹{paidRow.price}) — capped to ₹{paidRow.price}
                                            </p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Product Image */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className={labelCls}>Prod. Image</label>
                                    {(p.image || p.imageUrl) && (
                                        <div className="flex items-center gap-2">
                                            <button type="button"
                                                onClick={() => {
                                                    if (p.image) { const url = URL.createObjectURL(p.image); window.open(url, "_blank"); }
                                                    else if (p.imageUrl) window.open(p.imageUrl, "_blank");
                                                }}
                                                className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition" title="View Image">
                                                <FiEye size={14} />
                                            </button>
                                            {p.image && (
                                                <button type="button"
                                                    onClick={() => { const updated = [...products]; updated[index].image = null; setProducts(updated); }}
                                                    className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition" title="Remove Image">
                                                    <FiTrash2 size={14} />
                                                </button>
                                            )}
                                            {!p.image && p.imageUrl && <span className="p-1.5 bg-green-50 text-green-500 rounded-lg" title="Existing Image"><FiImage size={14} /></span>}
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" capture="environment"
                                    disabled={p.isFreeItem}
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const compressed = await normalizeToJpeg(file);
                                        const updated = [...products];
                                        updated[index].image = compressed;
                                        setProducts(updated);
                                    }}
                                    className="w-full text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-2 py-2 cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-orange-50 file:text-orange-600 hover:border-orange-300 transition-all" />
                            </div>

                            {/* Coating */}
                            {["LENS", "CONTACT LENS", "GLASS"].includes(p.category) && (

                                <div>
                                    <label htmlFor={`coating-${index}`} className={labelCls}>
                                        Coating
                                        {p.isFreeItem && <span className="text-teal-500 ml-1">🔒</span>}
                                    </label>
                                    <input id={`coating-${index}`} type="text"
                                        value={p.coating ?? ""}
                                        onChange={(e) => handleProductChange(index, "coating", e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                            )}

                            {/* Price */}
                            <div>
                                <label htmlFor={`price-${index}`} className={labelCls}>
                                    Price (₹) {!p.isFreeItem && <span className="text-red-500">*</span>}
                                    {p.isFreeItem && <span className="text-teal-500 ml-1">🔒</span>}
                                </label>
                                <input id={`price-${index}`} type="number" placeholder="0.00"
                                    value={p.price ?? ""}
                                    onChange={(e) => handleProductChange(index, "price", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : inputCls}
                                />
                                {/* Show max price hint on free row */}
                                {p.isFreeItem && (() => {
                                    const paidRow = products.find(
                                        (r) => r.bogoGroupId === p.bogoGroupId && !r.isFreeItem
                                    );
                                    if (paidRow) {
                                        return (
                                            <p className="text-[10px] text-teal-600 mt-0.5">
                                                Max: ₹{paidRow.price} (paid row MRP)
                                            </p>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label htmlFor={`quantity-${index}`} className={labelCls}>
                                    Quantity {!p.isFreeItem && <span className="text-red-500">*</span>}
                                    {p.isFreeItem && <span className="text-teal-500 ml-1">🔒</span>}
                                </label>
                                <input id={`quantity-${index}`} type="number" placeholder="1"
                                    value={p.quantity ?? ""}
                                    onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : inputCls}
                                />
                                {p.isFreeItem && (
                                    <p className="text-[10px] text-teal-600 mt-0.5">Matches paid row qty</p>
                                )}
                            </div>

                            {/* Discount ₹ */}
                            <div>
                                <label htmlFor={`discountRs-${index}`} className={labelCls}>
                                    Discount (₹) {p.isFreeItem && <span className="text-teal-500 ml-1">🔒</span>}
                                </label>
                                <input id={`discountRs-${index}`} type="number" placeholder="0.00"
                                    value={p.discount ?? ""}
                                    onChange={(e) => handleProductChange(index, "discount", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : inputCls}
                                />
                            </div>

                            {/* Discount % */}
                            <div>
                                <label htmlFor={`discountPercent-${index}`} className={labelCls}>
                                    Discount (%) {p.isFreeItem && <span className="text-teal-500 ml-1">🔒</span>}
                                </label>
                                <input id={`discountPercent-${index}`} type="number" placeholder="0"
                                    value={p.discountPercent ?? ""}
                                    onChange={(e) => handleProductChange(index, "discountPercent", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : inputCls}
                                />
                            </div>

                            {/* GST % */}
                            <div>
                                <label htmlFor={`gstPercent-${index}`} className={labelCls}>GST %</label>
                                <select id={`gstPercent-${index}`} value={p.gstPercent}
                                    onChange={(e) => handleProductChange(index, "gstPercent", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : selectCls}>
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>

                            {/* GST Type */}
                            <div>
                                <label htmlFor={`gstType-${index}`} className={labelCls}>GST Type</label>
                                <select id={`gstType-${index}`} value={p.gstType}
                                    onChange={(e) => handleProductChange(index, "gstType", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : selectCls}>
                                    <option value="EXCLUDED">Excluded</option>
                                    <option value="INCLUDED">Included</option>
                                </select>
                            </div>

                            {/* GST Mode */}
                            <div>
                                <label htmlFor={`gstMode-${index}`} className={labelCls}>GST Mode</label>
                                <select id={`gstMode-${index}`} value={p.gstMode}
                                    onChange={(e) => handleProductChange(index, "gstMode", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : selectCls}>
                                    <option value="CGST/SGST">CGST/SGST</option>
                                    <option value="IGST">IGST</option>
                                </select>
                            </div>

                            {/* GST Amount (read-only) */}
                            <div>
                                <label className={labelCls}>GST Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                    <input value={p.gstAmount ?? ""} readOnly className="w-full pl-6 pr-3 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-not-allowed" />
                                </div>
                            </div>

                            {/* Total (read-only) */}
                            <div>
                                <label className={labelCls}>
                                    Total {p.isFreeItem && <span className="text-teal-600 font-semibold ml-1">(Free)</span>}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                    <input
                                        value={p.isFreeItem ? "0.00" : (p.total ?? "")}
                                        readOnly
                                        className={`w-full pl-6 pr-3 py-2 text-sm border rounded-lg outline-none cursor-not-allowed ${p.isFreeItem
                                            ? "text-teal-600 font-semibold bg-teal-50 border-teal-200"
                                            : "text-gray-500 bg-gray-50 border-gray-200"
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Booked By */}
                            <div>
                                <label htmlFor={`bookedBy-${index}`} className={labelCls}>Booked By <span className="text-red-500">*</span></label>
                                <select id={`bookedBy-${index}`} value={p.bookedBy}
                                    onChange={(e) => handleProductChange(index, "bookedBy", e.target.value)} className={selectCls}>
                                    <option value="">Select</option>
                                    {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
                                </select>
                            </div>

                            {/* HSN/SAC */}
                            <div>
                                <label htmlFor={`hsnSac-${index}`} className={labelCls}>HSN/SAC</label>
                                <input id={`hsnSac-${index}`} type="text" placeholder="HSN/SAC code" value={p.hsnSac ?? ""}
                                    onChange={(e) => handleProductChange(index, "hsnSac", e.target.value)}
                                    disabled={p.isFreeItem}
                                    className={p.isFreeItem ? disabledInputCls : inputCls} />
                            </div>

                            {/* Lens fields */}
                            {["LENS", "CONTACT LENS", "GLASS"].includes(p.category) && (
                                <>
                                    <div>
                                        <label htmlFor={`lensAvailibilty-${index}`} className={labelCls}>Lens Avail <span className="text-red-500">*</span></label>
                                        <select id={`lensAvailibilty-${index}`} value={p.lensAvailibility}
                                            onChange={(e) => handleProductChange(index, "lensAvailibility", e.target.value)} className={selectCls}>
                                            <option value="">Select</option>
                                            <option value="INHOUSE">INHOUSE</option>
                                            <option value="ORDER">ORDER</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`orderToWhom-${index}`} className={labelCls}>Order to Whom</label>
                                        <select id={`orderToWhom-${index}`} value={p.vendorId}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const label = e.target.options[e.target.selectedIndex]?.text || "";
                                                const updated = [...products];
                                                updated[index] = { ...updated[index], vendorId: value, vendorName: label };
                                                setProducts(updated);
                                            }}
                                            className={selectCls}>
                                            <option value="">Select Vendor</option>
                                            {vendors?.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.name}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                <div className="flex justify-end mt-2">
                    <button type="button" onClick={addProductRow}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all shadow-sm">
                        + Add Product
                    </button>
                </div>
            </section>

            {/* ================= PAYMENT ================= */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <FiCreditCard className="text-xl text-orange-400" />
                    <h2 className="text-base font-bold text-gray-800">Payment Details</h2>
                </div>
                <div className="border-t border-gray-100 mb-5" />
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>
                                    Loyalty Points <span className="text-gray-400 font-normal">(Available: {availableLoyaltyPoints})</span>
                                </label>
                                <input id="loyaltyPoint" type="number" placeholder="0" min="0" max={availableLoyaltyPoints}
                                    value={paymentDetails.loyaltyPoints}
                                    onChange={(e) => { let value = Number(e.target.value); if (value > availableLoyaltyPoints) value = availableLoyaltyPoints; handlePaymentChange("loyaltyPoints", value); }}
                                    className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Additional Discount (₹)</label>
                                <input id="additionalDiscountRs" type="number" placeholder="0"
                                    value={paymentDetails.additionalDiscount === 0 ? "" : paymentDetails.additionalDiscount}
                                    onChange={(e) => handlePaymentChange("additionalDiscount", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Advance (₹)</label>
                                <input id="advance" type="number" placeholder="0"
                                    value={paymentDetails.advance === 0 ? "" : paymentDetails.advance}
                                    onChange={(e) => handlePaymentChange("advance", e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Transaction Type <span className="text-red-500">*</span></label>
                                <select id="transactionType" value={paymentDetails.transactionType}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionType: e.target.value })} className={selectCls}>
                                    <option value="">Select</option>
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CARD">Card</option>
                                    <option value="NA">NA</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelCls}>Remarks</label>
                                <textarea id="remark" rows={3} placeholder="Any additional notes..." value={paymentDetails.remark}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, remark: e.target.value })}
                                    className="w-full px-3 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-orange-300 transition-all placeholder-gray-400 resize-none" />
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-72 xl:w-80">
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 h-full">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Subtotal", value: paymentDetails.subTotal },
                                    { label: "Loyalty Discount", value: paymentDetails.loyaltyDiscount },
                                    { label: "Gross Total", value: paymentDetails.total },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center text-sm text-gray-600 pb-3 border-b border-orange-100">
                                        <span>{label}</span>
                                        <span className="font-medium text-gray-800">₹{value || "0.00"}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-orange-200">
                                <span className="text-sm font-bold text-gray-800">Balance Due</span>
                                <span className="text-lg font-bold text-orange-500">₹{paymentDetails.balance || "0.00"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= PRESCRIPTION ================= */}
            {/* <section className="shadow-lg">
                <Prescription prescription={prescription} setPrescription={setPrescription} />
            </section> */}

            {prescriptions.length > 0 && (
                <section className="space-y-4">
                    {prescriptions.map(rx => {
                        const linkedProduct = products.find(p => p.key === rx.productKey);
                        const productIndex = products.findIndex(p => p.key === rx.productKey);

                        return (
                            <div
                                key={rx.id}
                                id={`rx-${rx.id}`}
                                className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-500 text-xl">🔬</span>
                                        <h2 className="text-base font-bold text-gray-800">
                                            Prescription — Product #{productIndex + 1}
                                        </h2>
                                        {linkedProduct?.productName && (
                                            <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                                {linkedProduct.productName}
                                            </span>
                                        )}
                                    </div>


                                    {/* // In the prescription map — disable trash when only 1 prescription exists */}
                                    <button
                                        type="button"
                                        onClick={() => removePrescription(rx.id)}
                                        disabled={prescriptions.length === 1}
                                        className={`p-2 rounded-full transition ${prescriptions.length === 1
                                            ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                            : "bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600"
                                            }`}
                                        title={prescriptions.length === 1 ? "At least one prescription required" : "Remove prescription"}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>

                                {/* <Prescription
                                    prescription={rx}
                                    setPrescription={(updated) => updatePrescription(rx.id, updated)}
                                /> */}

                                {/* <Prescription
                                    prescription={{
                                        eyewear: rx.eyewear,
                                        transpose: rx.transpose,
                                        contactLens: rx.contactLens,
                                    }}
                                    setPrescription={(updated) =>
                                        updatePrescription(rx.id, {
                                            eyewear: updated.eyewear ?? rx.eyewear,
                                            contactLens: updated.contactLens ?? rx.contactLens,
                                            transpose: updated.transpose ?? rx.transpose,
                                        })
                                    }
                                /> */}

                                <Prescription
                                    prescription={{
                                        eyewear: rx.eyewear,
                                        transpose: rx.transpose,
                                        contactLens: rx.contactLens,
                                    }}
                                    setPrescription={(updaterOrValue) => updatePrescription(rx.id, updaterOrValue)}
                                />
                            </div>
                        );
                    })}
                </section>
            )}

            <section className="shadow-lg p-4">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label htmlFor="powerremark">Power Remark</label>
                        <input id="powerremark" className="input" value={restPrescription.powerRemark}
                            onChange={(e) => setRestPrescription({ ...restPrescription, powerRemark: e.target.value })} />
                    </div>
                </div>
            </section>

            <section className="shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {["frm", "cor", "a", "b", "dbl", "afh", "pd", "r", "l", "ed", "dia"].map((field) => (
                        <div key={field}>
                            <label htmlFor={field}>{field.toUpperCase()}</label>
                            <input id={field} className="input" value={restPrescription[field]}
                                onChange={(e) => setRestPrescription({ ...restPrescription, [field]: e.target.value })} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="shadow-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                    <div>
                        <label htmlFor="send">Send Message</label>
                        <select id="send" className="input" value={restPrescription.sendMessage}
                            onChange={(e) => setRestPrescription({ ...restPrescription, sendMessage: e.target.value })}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="shadow-lg p-4">
                <div className="flex items-center justify-end gap-5 mt-8">
                    <button type="button"
                        onClick={() => { setRestPrescription({ ...restPrescription, jcStatus: "Draft", pstatus: "Draft" }); handleSubmit(); }}
                        className="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-medium shadow-md shadow-gray-500/30 hover:shadow-lg hover:shadow-gray-500/40 transition-all duration-200 active:scale-95 cursor-pointer">
                        <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                        <span className="relative flex items-center gap-2">Save as Draft</span>
                    </button>
                    <button
                        onClick={() => { setRestPrescription({ ...restPrescription, jcStatus: "Active", pstatus: "In-process" }); handleSubmit(); }}
                        className="group relative px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 active:scale-95 cursor-pointer">
                        <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                        <span className="relative flex items-center gap-2">Submit & Process</span>
                    </button>
                </div>
            </section>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Suggestion Dropdown
// ─────────────────────────────────────────────────────────────────────────────
function SuggestionDropdown({ suggestions, onSelect, onClose }) {
    return (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
            style={{ animation: "fadeDown 0.15s ease" }}>
            <style>{`@keyframes fadeDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {suggestions.length} result{suggestions.length !== 1 ? "s" : ""} found
                </span>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
            </div>
            {suggestions.map((customer) => (
                <button key={customer._id} type="button" onClick={() => onSelect(customer)}
                    className="w-full text-left px-4 py-3 hover:bg-orange-50 transition border-b border-gray-50 last:border-0 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center shrink-0">
                        {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.mobile}</p>
                    </div>
                    <span className="text-[10px] text-orange-400 font-medium shrink-0">Fill →</span>
                </button>
            ))}
        </div>
    );
}