// src/utils/invoiceTemplates.js

const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-IN") : "-";
const formatTime = (date) => date ? new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "-";

const sharedStyles = `
  @page { size: A4; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#fff; padding:30px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .invoice { width:100%; max-width:800px; margin:auto; border:1px solid #e0c8a8; border-radius:8px; overflow:hidden; }
  .invoice-header { display:flex; justify-content:space-between; align-items:center; padding:10px 24px; }
  .invoice-header h1 { font-size:34px; font-weight:700; letter-spacing:2px; color:#e8710a; }
  .store-logo img { width:200px; height:200px; object-fit:contain; }
  .details { display:grid; grid-template-columns:2fr 1fr; }
  .details-left, .details-right { padding:14px; font-size:13px; }
  .details p { margin-bottom:4px; }
  .customer-section { margin-top:6px; padding-top:6px; border-top:1px solid #e0c8a8; }
  .customer-section .label { font-weight:700; color:#e8710a; margin-bottom:3px; }
  .section-title { background:#fdf0e2; padding:4px 16px; font-size:13px; font-weight:700; letter-spacing:1px; color:#e8710a; }
  .content { padding:24px; }
  .content > * + * { margin-top:14px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  thead tr { background:#e8710a; color:#fff; }
  th, td { padding:4px 12px; }
  td.center, th.center { text-align:center; }
  td.bold { font-weight:600; }
  tbody tr:nth-child(even) { background:#faf6f2; }
  .summary-block { border:1px solid #e0c8a8; border-radius:6px; overflow:hidden; }
  .prescription-grid { display:grid; grid-template-columns:1fr 1fr; }
  .prescription-grid > div:first-child { border-right:1px solid #e0c8a8; }
  .eye-title { background:#e8710a; color:#fff; text-align:center; padding:6px; font-size:13px; font-weight:600; }
  .prescription-grid table th { background:#faf6f2; color:#2a1f14; font-size:11px; text-align:center; }
  .prescription-grid table td { text-align:center; font-size:12px; }
  .invoice-footer { text-align:center; padding:8px 24px; border-top:1px solid #e0c8a8; }
  .invoice-footer p { font-size:12px; color:#8a7a6a; }
  .invoice-footer .thanks { font-size:14px; font-weight:600; color:#e8710a; }
`;

const prescriptionBlock = (prescription, items) => {
  if (!prescription?.length) return "";
  const list = Array.isArray(prescription) ? prescription : [prescription];
  return `<div class="summary-block">${list.map((pres, i) => {
    const r = pres?.eyewear?.rightEye || {};
    const l = pres?.eyewear?.leftEye || {};
    const linked = items?.find(p => p.productKey === pres?.productKey);
    const label = linked ? linked.name || "-" : "Product not found";
    return `
      <div style="margin-bottom:12px;border-bottom:1px dashed #e0c8a8;padding-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px;">
          <span style="font-size:12px;font-weight:700;color:#e8710a;padding:0 10px;">Prescription ${i + 1}</span>
          <span style="font-size:11px;font-weight:600;color:#1d4ed8;background:#eff6ff;border:1px solid #bfdbfe;padding:2px 10px;border-radius:999px;">${label}</span>
        </div>
        <div class="prescription-grid">
          <div><div class="eye-title">Right Eye</div>
            <table><thead><tr><th></th><th>SPH</th><th>CYL</th><th>AXIS</th><th>V/N</th></tr></thead>
            <tbody>
              <tr><td>DV</td><td>${r.sph||"-"}</td><td>${r.cyl||"-"}</td><td>${r.axis||"-"}</td><td>${r.vis||"-"}</td></tr>
              <tr><td>NV</td><td>${r.nv_sph||"-"}</td><td>${r.nv_cyl||"-"}</td><td>${r.nv_axis||"-"}</td><td>${r.nv_vis||"-"}</td></tr>
              <tr><td>ADD</td><td>${r.add||"-"}</td><td>-</td><td>-</td><td>-</td></tr>
            </tbody></table></div>
          <div><div class="eye-title">Left Eye</div>
            <table><thead><tr><th></th><th>SPH</th><th>CYL</th><th>AXIS</th><th>V/N</th></tr></thead>
            <tbody>
              <tr><td>DV</td><td>${l.sph||"-"}</td><td>${l.cyl||"-"}</td><td>${l.axis||"-"}</td><td>${l.vis||"-"}</td></tr>
              <tr><td>NV</td><td>${l.nv_sph||"-"}</td><td>${l.nv_cyl||"-"}</td><td>${l.nv_axis||"-"}</td><td>${l.nv_vis||"-"}</td></tr>
              <tr><td>ADD</td><td>${l.add||"-"}</td><td>-</td><td>-</td><td>-</td></tr>
            </tbody></table></div>
        </div>
      </div>`;
  }).join("")}</div>`;
};

const shell = (title, d, body) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
<style>${sharedStyles}</style></head><body>
<div class="invoice">
  <div class="invoice-header">
    <h1>${title}</h1>
    <div class="store-logo">${d.logoUrl ? `<img src="${d.logoUrl}" />` : ""}</div>
  </div>
  <div class="details">
    <div class="details-left">
      <p><strong>Bill Number:</strong> ${d.jcNo}</p>
      <p><strong>Company Name:</strong> ${d.companyName}</p>
      <p><strong>Address:</strong> ${d.companyAddress}</p>
      <p><strong>Email:</strong> ${d.companyEmail}</p>
      <p><strong>Phone:</strong> ${d.companyPhone}</p>
      ${d.companyGstin ? `<p>GSTIN: ${d.companyGstin}</p>` : ""}
    </div>
    <div class="details-right">
      <p><strong>Date of Order:</strong> ${formatDate(d.orderDate)}</p>
      <p><strong>Time of Order:</strong> ${formatTime(d.orderDate)}</p>
      <p><strong>Date of Delivery:</strong> ${formatDate(d.deliveryDate)}</p>
      <div class="customer-section">
        <p class="label">Customer Details:</p>
        <p><strong>Name:</strong> ${d.customerName || "-"}</p>
        <p><strong>Address:</strong> ${d.customerAddress || "-"}</p>
        <p><strong>Phone:</strong> ${d.customerPhone || "-"}</p>
      </div>
    </div>
  </div>
  <div class="content">${body}
    <div class="invoice-footer">
      <p>No signature is required as this is a system-generated invoice.</p>
      <p class="thanks">Thank you for your business!</p>
    </div>
  </div>
</div></body></html>`;

const paymentSummary = (d) => `
  <div><div class="section-title">Payment Summary</div>
    <table><thead><tr><th class="center">Grand Total</th><th class="center">Advanced Paid</th><th class="center">Balance Due</th><th class="center">Payment Method</th></tr></thead>
    <tbody><tr><td class="center bold">Rs. ${d.total}</td><td class="center">Rs. ${d.advance}</td><td class="center bold">Rs. ${d.balance}</td><td class="center">${d.ttype}</td></tr></tbody>
  </table></div>`;

export const generateAdvanceInvoiceWithGstHTML = (d) => {
  const rows = d.items.map((item, i) => `<tr><td class="center">${i+1}</td><td class="center">${item.name}</td><td class="center">${item.hsnSac}</td><td class="center">${Number(item.price).toFixed(2)}</td><td class="center">${item.quantity}</td><td class="center">${Number(item.discount).toFixed(2)}</td><td class="center bold">${Number(item.total).toFixed(2)}</td></tr>`).join("");
  return shell("Advance Receipt", d, `
    <div><div class="section-title">Items</div>
      <table><thead><tr><th>S.No</th><th>Item</th><th>HSN</th><th class="center">Price</th><th class="center">Qty</th><th class="center">Discount</th><th class="center">Amount</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div><div class="section-title">Tax Summary</div>
      <table><thead><tr><th>Sub Total</th><th>Add. Discount</th><th>SGST</th><th>CGST</th><th>IGST</th></tr></thead>
      <tbody><tr><td class="center">${d.subTotal}</td><td class="center">${d.additionalDiscount}</td><td class="center">${d.sgst}</td><td class="center">${d.cgst}</td><td class="center">${d.igst}</td></tr></tbody></table></div>
    ${paymentSummary(d)}
    ${d.showPrescription ? prescriptionBlock(d.prescription, d.items) : ""}`);
};

export const generateAdvanceInvoiceWithoutGstHTML = (d) => {
  const rows = d.items.map((item, i) => `<tr><td class="center">${i+1}</td><td class="center">${item.name}</td><td class="center">${Number(item.price).toFixed(2)}</td><td class="center">${item.quantity}</td><td class="center">${Number(item.discount).toFixed(2)}</td><td class="center bold">${Number(item.total).toFixed(2)}</td></tr>`).join("");
  return shell("Advance Receipt", d, `
    <div><div class="section-title">Items</div>
      <table><thead><tr><th>S.No</th><th>Item</th><th class="center">Price</th><th class="center">Qty</th><th class="center">Discount</th><th class="center">Amount</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div><div class="section-title">Summary</div>
      <table><thead><tr><th>Sub Total</th><th>Add. Discount</th></tr></thead>
      <tbody><tr><td class="center">${d.subTotal}</td><td class="center">${d.additionalDiscount}</td></tr></tbody></table></div>
    ${paymentSummary(d)}
    ${d.showPrescription ? prescriptionBlock(d.prescription, d.items) : ""}`);
};

export const generateDeliveredInvoiceWithGstHTML = (d) => {
  const rows = d.items.map((item, i) => `<tr><td class="center">${i+1}</td><td class="center">${item.name}</td><td class="center">${item.hsnSac}</td><td class="center">${Number(item.price).toFixed(2)}</td><td class="center">${item.quantity}</td><td class="center">${Number(item.discount).toFixed(2)}</td><td class="center bold">${Number(item.total).toFixed(2)}</td></tr>`).join("");
  return shell("Invoice Receipt", d, `
    <div><div class="section-title">Items</div>
      <table><thead><tr><th>S.No</th><th>Item</th><th>HSN</th><th class="center">Price</th><th class="center">Qty</th><th class="center">Discount</th><th class="center">Amount</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div><div class="section-title">Tax Summary</div>
      <table><thead><tr><th>Sub Total</th><th>Add. Discount</th><th>SGST</th><th>CGST</th><th>IGST</th></tr></thead>
      <tbody><tr><td class="center">${d.subTotal}</td><td class="center">${d.additionalDiscount}</td><td class="center">${d.sgst}</td><td class="center">${d.cgst}</td><td class="center">${d.igst}</td></tr></tbody></table></div>
    ${paymentSummary(d)}
    ${d.showPrescription ? prescriptionBlock(d.prescription, d.items) : ""}`);
};

export const generateDeliveredInvoiceWithoutGstHTML = (d) => {
  const rows = d.items.map((item, i) => `<tr><td class="center">${i+1}</td><td class="center">${item.name}</td><td class="center">${Number(item.price).toFixed(2)}</td><td class="center">${item.quantity}</td><td class="center">${Number(item.discount).toFixed(2)}</td><td class="center bold">${Number(item.total).toFixed(2)}</td></tr>`).join("");
  return shell("Invoice Receipt", d, `
    <div><div class="section-title">Items</div>
      <table><thead><tr><th>S.No</th><th>Item</th><th class="center">Price</th><th class="center">Qty</th><th class="center">Discount</th><th class="center">Amount</th></tr></thead>
      <tbody>${rows}</tbody></table></div>
    <div><div class="section-title">Summary</div>
      <table><thead><tr><th>Sub Total</th><th>Add. Discount</th></tr></thead>
      <tbody><tr><td class="center">${d.subTotal}</td><td class="center">${d.additionalDiscount}</td></tr></tbody></table></div>
    ${paymentSummary(d)}
    ${d.showPrescription ? prescriptionBlock(d.prescription, d.items) : ""}`);
};

// Build invoiceData object from raw jobCard + products + prescription
export const buildInvoiceData = (jobCard, products = [], prescription = [], store = {}) => {
  const includedTax = products.reduce((sum, item) =>
    item.gstType === "INCLUDED" ? sum + (item.gstAmount || 0) : sum, 0);

  const items = products.map(item => ({
    name: item.productName || item.otherProductName || "N/A",
    price: item.price || 0,
    quantity: item.quantity || 0,
    hsnSac: item.hsnSac || "-",
    discount: item.discount || 0,
    total: item.price * item.quantity - (item.discount || 0) + (item.gstType === "EXCLUDED" ? (item.gstAmount || 0) : 0),
    cgst: item.cgst || 0, sgst: item.sgst || 0, igst: item.igst || 0,
    gstType: item.gstType || 0, gstAmount: item.gstAmount || 0,
    productKey: item.productKey,
  }));

  let totalCgst = 0, totalSgst = 0, totalIgst = 0;
  products.forEach(p => { totalCgst += p.cgst || 0; totalSgst += p.sgst || 0; totalIgst += p.igst || 0; });

  return {
    jcNo: jobCard.billNo || jobCard.jcNumber,
    companyName: store.storeName, companyAddress: store.address,
    companyEmail: store.email, companyPhone: store.mobile, companyGstin: store.gstNumber,
    orderDate: jobCard.orderDate, deliveryDate: jobCard.deliveryDate,
    customerName: jobCard.name, customerAddress: jobCard.address, customerPhone: jobCard.mobile,
    items,
    subTotal: jobCard.subTotal - includedTax,
    additionalDiscount: jobCard.additionalDiscount,
    sgst: totalSgst, cgst: totalCgst, igst: totalIgst,
    total: jobCard.total - jobCard.additionalDiscount,
    advance: jobCard.advance, balance: jobCard.balance,
    ttype: jobCard.transactionType,
    logoUrl: store.logo || "/ilw-logo-icon.png",
    prescription,
  };
};

// Fire the OS print dialog
export const printInvoiceHTML = (html) => {
  const win = window.open("", "_blank", "width=900,height=700");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
};