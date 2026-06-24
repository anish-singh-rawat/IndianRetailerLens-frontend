import { useEffect, useState } from "react";

export default function PrescriptionSection({ prescription, setPrescription }) {

    const [type, setType] = useState("eyewear");
    const [suggestions, setSuggestions] = useState([]);
    const [activeField, setActiveField] = useState(null);



    const normalizeQuarterPower = (value) => {
        let num = parseFloat(value);

        if (isNaN(num)) return "";

        // Clamp range
        if (num > 20) num = 20;
        if (num < -20) num = -20;

        // Round to nearest 0.25
        num = Math.round(num / 0.25) * 0.25;

        return num;
    };



    const formatPower = (value) => {
        const num = parseFloat(value);

        if (isNaN(num)) return "";

        const fixed = Math.abs(num).toFixed(2);

        if (num > 0) return `+${fixed}`;
        if (num < 0) return `-${fixed}`;
        return "0.00";
    };


    // format the sph/cyl/add input fields value when blur
    const handleBlurFormat = (section, eye, field, value) => {

        if (field === "sph" || field === "cyl" || field === "nv_sph" || field === "nv_cyl" || field === "add") {

            const normalized = normalizeQuarterPower(value);

            const formatted = formatPower(normalized);

            setPrescription(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [eye]: {
                        ...prev[section][eye],
                        [field]: formatted
                    }
                }
            }));
        }

        // Close suggestion dropdown on blur
        setTimeout(() => {
            setSuggestions([]);
            setActiveField(null);
        }, 150);

    };



    const calculateNearVision = (section, eye) => {
        setPrescription(prev => {
            const sph = parseFloat(prev[section][eye].sph);
            const add = parseFloat(prev[section][eye].add);

            if (isNaN(sph) || isNaN(add) || add < 0) {
                return prev;
            }

            const result = sph + add;

            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [eye]: {
                        ...prev[section][eye],
                        nv_sph: formatPower(result),
                        nv_cyl: prev[section][eye].cyl,
                        nv_axis: prev[section][eye].axis
                    }
                }
            };
        });
    };


    const POWER_FIELDS = ["sph", "cyl", "nv_sph", "nv_cyl", "add"];

    const handleChange = (section, eye, field, value) => {

        setPrescription(prev => {
            const updated = {
                ...prev,
                [section]: {
                    ...prev[section],
                    [eye]: {
                        ...prev[section][eye],
                        [field]: value
                    }
                }
            };

            return updated;
        });

        // Near Vision Recalculation
        if (section === "eyewear" && (field === "sph" || field === "add")) {
            calculateNearVision(section, eye);
        }

        // Copy CYL to NV
        if (section === "eyewear" && field === "cyl") {
            setPrescription(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [eye]: {
                        ...prev[section][eye],
                        nv_cyl: value
                    }
                }
            }));
        }

        // Copy AXIS to NV
        if (section === "eyewear" && field === "axis") {
            const axisValue = parseInt(value);
            if (!isNaN(axisValue) && axisValue >= 0 && axisValue <= 180) {
                setPrescription(prev => ({
                    ...prev,
                    [section]: {
                        ...prev[section],
                        [eye]: {
                            ...prev[section][eye],
                            nv_axis: axisValue
                        }
                    }
                }));
            }
        }

        // Suggestion Logic
        if (POWER_FIELDS.includes(field)) {

            let clean = value.replace("+", "");

            if (field === "add") {
                clean = clean.replace("-", "");
            } else {
                clean = clean.replace("-", "");
            }

            if (clean && !clean.includes(".")) {
                const generated = generatePowerSuggestions(clean, field);
                setSuggestions(generated);
                setActiveField({ section, eye, field });
            } else {
                setSuggestions([]);
                setActiveField(null);
            }
        }
    };


    const handleTranspose = (eye) => {
        setPrescription(prev => {

            const eData = prev.eyewear[eye];

            const sph = parseFloat(eData.sph);
            const cyl = parseFloat(eData.cyl);
            const axis = parseInt(eData.axis);
            const add = parseFloat(eData.add);

            // Only SPH & CYL are required
            if (isNaN(sph) || isNaN(cyl)) {
                return prev;
            }

            // ---- Transpose Calculation ----
            const newSph = sph + cyl;
            const newCyl = -cyl;

            // ---- Axis Calculation (Optional) ----
            let newAxis = "";

            if (!isNaN(axis)) {
                newAxis = axis + 90;
                if (newAxis > 180) {
                    newAxis -= 180;
                }
            }

            // ---- Near Vision Calculation ----
            let newNvSph = "";
            if (!isNaN(add) && add >= 0) {
                newNvSph = formatPower(newSph + add);
            }

            return {
                ...prev,
                transpose: {
                    ...prev.transpose,
                    [eye]: {
                        ...prev.transpose[eye],
                        sph: formatPower(newSph),
                        cyl: formatPower(newCyl),
                        axis: newAxis,
                        add: eData.add || "",
                        nv_sph: newNvSph,
                        nv_cyl: formatPower(newCyl),
                        nv_axis: newAxis
                    }
                }
            };
        });
    };


    useEffect(() => {
        handleTranspose("rightEye");
        handleTranspose("leftEye");
    }, [
        prescription.eyewear.rightEye,
        prescription.eyewear.leftEye
    ]);



    const generatePowerSuggestions = (value, field) => {
        const base = parseInt(value);

        if (isNaN(base)) return [];

        const variants = [];

        for (let i = 0; i <= 0.75; i += 0.25) {

            const plus = base + i;

            // If ADD → only positive
            if (field === "add") {
                variants.push(formatPower(plus));
            } else {
                const minus = -(base + i);
                variants.push(formatPower(plus));
                variants.push(formatPower(minus));
            }
        }

        return variants;
    };


    // render power suggestion
    const renderSuggestions = (section, eye, field) => {
        if (
            activeField?.section === section &&
            activeField?.eye === eye &&
            activeField?.field === field &&
            suggestions.length > 0
        ) {
            return (
                <div className="absolute bg-white border rounded shadow mt-1 z-20 w-full max-h-40 overflow-y-auto">
                    {suggestions.map((item, index) => (
                        <div
                            key={index}
                            className="px-3 py-1 hover:bg-orange-100 cursor-pointer"
                            onMouseDown={() => {
                                handleChange(section, eye, field, item);
                                setSuggestions([]);
                                setActiveField(null);
                            }}

                        >
                            {item}
                        </div>
                    ))}
                </div>
            );
        }
    };


    // Copy prescription right to left and vise versa for all prescription type
    const copyEyeValues = (section, fromEye, toEye) => {
        setPrescription(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [toEye]: {
                    ...prev[section][fromEye]
                }
            }
        }));
    };


    const inputClass = "w-full px-2 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 hover:border-orange-300 transition-all text-center placeholder-gray-300";




    return (
        <div className="bg-white rounded-xl shadow p-6">

            {/* Section Title */}
            <h2 className="text-lg font-semibold mb-4">Prescription Details</h2>

            {/* Switch Buttons */}
            <div className="flex gap-2 mb-6">
                {["eyewear", "transpose", "contact"].map((t) => (
                    <button key={t} onClick={(e) => { e.preventDefault(); setType(t); }} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer 
                        ${type === t ? "bg-orange-500 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
                    >
                        {t === "eyewear" && "Eyewear"}
                        {t === "transpose" && "Transpose"}
                        {t === "contact" && "Contact Lens"}
                    </button>
                ))}
            </div>

            {/* EYEWEAR PRESCRIPTION */}
            {(type === "eyewear") && (
                <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2">
                        Eyewear Prescription
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">

                        {/* RIGHT EYE */}
                        <div className="border border-gray-300 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold">Right Eye</h3>
                                <button
                                    type="button"
                                    onClick={() => copyEyeValues(type === "eyewear" ? "eyewear" : type, "rightEye", "leftEye")}
                                    className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 cursor-pointer"
                                >
                                    Copy → Left
                                </button>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                <label></label>
                                <label>SPH</label>
                                <label>CYL</label>
                                <label>AXIS</label>
                                <label>VIS</label>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                <label>D.V</label>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.rightEye.sph}
                                        onChange={(e) => handleChange("eyewear", "rightEye", "sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "rightEye", "sph", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "rightEye", "sph")}
                                </div>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.rightEye.cyl}
                                        onChange={(e) => handleChange("eyewear", "rightEye", "cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "rightEye", "cyl", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "rightEye", "cyl")}
                                </div>

                                <input className={inputClass} value={prescription.eyewear.rightEye.axis} onChange={(e) => handleChange("eyewear", "rightEye", "axis", e.target.value)} />

                                <input className={inputClass} value={prescription.eyewear.rightEye.vis} onChange={(e) => handleChange("eyewear", "rightEye", "vis", e.target.value)} />
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 mt-2 items-center text-center">
                                <label>N.V</label>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.rightEye.nv_sph}
                                        onChange={(e) => handleChange("eyewear", "rightEye", "nv_sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "rightEye", "nv_sph", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "rightEye", "nv_sph")}
                                </div>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.rightEye.nv_cyl}
                                        onChange={(e) => handleChange("eyewear", "rightEye", "nv_cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "rightEye", "nv_cyl", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "rightEye", "nv_cyl")}
                                </div>

                                <input className={inputClass} value={prescription.eyewear.rightEye.nv_axis} onChange={(e) => handleChange("eyewear", "rightEye", "nv_axis", e.target.value)} />

                                <input className={inputClass} value={prescription.eyewear.rightEye.nv_vis} onChange={(e) => handleChange("eyewear", "rightEye", "nv_vis", e.target.value)} />
                            </div>

                            <div className="grid grid-cols-[50px_repeat(1,1fr)] gap-2 mt-2 items-center text-center">
                                <label>ADD</label>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.rightEye.add}
                                        onChange={(e) => handleChange("eyewear", "rightEye", "add", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "rightEye", "add", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "rightEye", "add")}
                                </div>
                            </div>
                        </div>

                        {/* LEFT EYE */}
                        <div className="border border-gray-300 rounded-lg p-4">
                            {/* <h3 className="font-semibold mb-3">Left Eye</h3> */}
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold">Left Eye</h3>
                                <button
                                    type="button"
                                    onClick={() => copyEyeValues(type === "eyewear" ? "eyewear" : type, "leftEye", "rightEye" )}
                                    className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 cursor-pointer"
                                >
                                    Copy → Right
                                </button>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                <label></label>
                                <label>SPH</label>
                                <label>CYL</label>
                                <label>AXIS</label>
                                <label>VIS</label>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                <label>D.V</label>

                                <div className="relative">

                                    <input className={inputClass} value={prescription.eyewear.leftEye.sph}
                                        onChange={(e) => handleChange("eyewear", "leftEye", "sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "leftEye", "sph", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "leftEye", "sph")}
                                </div>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.leftEye.cyl}
                                        onChange={(e) => handleChange("eyewear", "leftEye", "cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "leftEye", "cyl", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "leftEye", "cyl")}
                                </div>

                                <input className={inputClass} value={prescription.eyewear.leftEye.axis} onChange={(e) => handleChange("eyewear", "leftEye", "axis", e.target.value)} />

                                <input className={inputClass} value={prescription.eyewear.leftEye.vis} onChange={(e) => handleChange("eyewear", "leftEye", "vis", e.target.value)} />

                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 mt-2 items-center text-center">
                                <label>N.V</label>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.leftEye.nv_sph}
                                        onChange={(e) => handleChange("eyewear", "leftEye", "nv_sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "leftEye", "nv_sph", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "leftEye", "nv_sph")}
                                </div>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.leftEye.nv_cyl}
                                        onChange={(e) => handleChange("eyewear", "leftEye", "nv_cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "leftEye", "nv_cyl", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "leftEye", "nv_cyl")}
                                </div>

                                <input className={inputClass} value={prescription.eyewear.leftEye.nv_axis} onChange={(e) => handleChange("eyewear", "leftEye", "nv_axis", e.target.value)} />

                                <input className={inputClass} value={prescription.eyewear.leftEye.nv_vis} onChange={(e) => handleChange("eyewear", "leftEye", "nv_vis", e.target.value)} />
                            </div>

                            <div className="grid grid-cols-[50px_repeat(1,1fr)] gap-2 mt-2 items-center text-center">
                                <label>ADD</label>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.eyewear.leftEye.add}
                                        onChange={(e) => handleChange("eyewear", "leftEye", "add", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("eyewear", "leftEye", "add", e.target.value)}
                                    />
                                    {renderSuggestions("eyewear", "leftEye", "add")}
                                </div>

                            </div>
                        </div>

                    </div>
                </>
            )}

            {/* TRANSPOSE PRESCRIPTION */}
            {(type === "transpose") && (
                <>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2">
                        Transpose Prescription
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* RIGHT EYE */}
                        <div className="border border-gray-300 rounded-lg p-4">
                            {/* <h3 className="font-semibold mb-3">Right Eye</h3> */}
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold">Right Eye</h3>
                                <button
                                    type="button"
                                    onClick={() => copyEyeValues(type === "transpose" ? "transpose" : type, "rightEye", "leftEye")}
                                    className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 cursor-pointer"
                                >
                                    Copy → Left
                                </button>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                <label></label>
                                <label>SPH</label>
                                <label>CYL</label>
                                <label>AXIS</label>
                                <label>VIS</label>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">

                                <label>D.V</label>

                                <div className="relative">

                                    <input className={inputClass} value={prescription.transpose.rightEye.sph}
                                        onChange={(e) => handleChange("transpose", "rightEye", "sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "rightEye", "sph", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "rightEye", "sph")}
                                </div>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.transpose.rightEye.cyl}
                                        onChange={(e) => handleChange("transpose", "rightEye", "cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "rightEye", "cyl", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "rightEye", "cyl")}
                                </div>

                                <input className={inputClass} value={prescription.transpose.rightEye.axis} onChange={(e) => handleChange("transpose", "rightEye", "axis", e.target.value)} />

                                <input className={inputClass} value={prescription.transpose.rightEye.vis} onChange={(e) => handleChange("transpose", "rightEye", "vis", e.target.value)} />

                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 mt-2 items-center text-center">

                                <label>N.V</label>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.transpose.rightEye.nv_sph}
                                        onChange={(e) => handleChange("transpose", "rightEye", "nv_sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "rightEye", "nv_sph", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "rightEye", "nv_sph")}
                                </div>

                                <div className="relative">

                                    <input className={inputClass} value={prescription.transpose.rightEye.nv_cyl}
                                        onChange={(e) => handleChange("transpose", "rightEye", "nv_cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "rightEye", "nv_cyl", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "rightEye", "nv_cyl")}
                                </div>

                                <input className={inputClass} value={prescription.transpose.rightEye.nv_axis} onChange={(e) => handleChange("transpose", "rightEye", "nv_axis", e.target.value)} />

                                <input className={inputClass} value={prescription.transpose.rightEye.nv_vis} onChange={(e) => handleChange("transpose", "rightEye", "nv_vis", e.target.value)} />

                            </div>

                            <div className="grid grid-cols-[50px_repeat(1,1fr)] gap-2 mt-2 items-center text-center">

                                <label>ADD</label>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.transpose.rightEye.add}
                                        onChange={(e) => handleChange("transpose", "rightEye", "add", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "rightEye", "add", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "rightEye", "add")}
                                </div>

                            </div>
                        </div>

                        {/* LEFT EYE */}
                        <div className="border border-gray-300 rounded-lg p-4">
                            {/* <h3 className="font-semibold mb-3">Left Eye</h3> */}

                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold">Left Eye</h3>
                                <button
                                    type="button"
                                    onClick={() => copyEyeValues(type === "transpose" ? "transpose" : type, "leftEye", "rightEye" )}
                                    className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 cursor-pointer"
                                >
                                    Copy → Right
                                </button>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                <label></label>
                                <label>SPH</label>
                                <label>CYL</label>
                                <label>AXIS</label>
                                <label>VIS</label>
                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">

                                <label>D.V</label>
                                <div className="relative">
                                    <input className={inputClass} value={prescription.transpose.leftEye.sph}
                                        onChange={(e) => handleChange("transpose", "leftEye", "sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "leftEye", "sph", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "leftEye", "sph")}
                                </div>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.transpose.leftEye.cyl}
                                        onChange={(e) => handleChange("transpose", "leftEye", "cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "leftEye", "cyl", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "leftEye", "cyl")}
                                </div>

                                <input className={inputClass} value={prescription.transpose.leftEye.axis} onChange={(e) => handleChange("transpose", "leftEye", "axis", e.target.value)} />

                                <input className={inputClass} value={prescription.transpose.leftEye.vis} onChange={(e) => handleChange("transpose", "leftEye", "vis", e.target.value)} />

                            </div>

                            <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 mt-2 items-center text-center">

                                <label>N.V</label>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.transpose.leftEye.nv_sph}
                                        onChange={(e) => handleChange("transpose", "leftEye", "nv_sph", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "leftEye", "nv_sph", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "leftEye", "nv_sph")}
                                </div>

                                <div className="relative">
                                    <input className={inputClass} value={prescription.transpose.leftEye.nv_cyl}
                                        onChange={(e) => handleChange("transpose", "leftEye", "nv_cyl", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "leftEye", "nv_cyl", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "leftEye", "nv_cyl")}
                                </div>

                                <input className={inputClass} value={prescription.transpose.leftEye.nv_axis} onChange={(e) => handleChange("transpose", "leftEye", "nv_axis", e.target.value)} />

                                <input className={inputClass} value={prescription.transpose.leftEye.nv_vis} onChange={(e) => handleChange("transpose", "leftEye", "nv_vis", e.target.value)} />

                            </div>

                            <div className="grid grid-cols-[50px_repeat(1,1fr)] gap-2 mt-2 items-center text-center">

                                <label>ADD</label>

                                <div className="relative">

                                    <input className={inputClass} value={prescription.transpose.leftEye.add}
                                        onChange={(e) => handleChange("transpose", "leftEye", "add", e.target.value)}
                                        onBlur={(e) => handleBlurFormat("transpose", "leftEye", "add", e.target.value)}
                                    />

                                    {renderSuggestions("transpose", "leftEye", "add")}
                                </div>

                            </div>
                        </div>

                    </div>
                </>
            )
            }

            {/* CONTACT LENS */}
            {
                (type === "contact") && (
                    <>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2">
                            Contact Lens Prescription
                        </h2>


                        <div className="grid md:grid-cols-2 gap-6">

                            {/* RIGHT EYE */}
                            <div className="border border-gray-300 rounded-lg p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold">Right Eye</h3>
                                    <button
                                        type="button"
                                        onClick={() => copyEyeValues(type === "contact" ? "contactLens" : type, "rightEye", "leftEye")}
                                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 cursor-pointer"
                                    >
                                        Copy → Left
                                    </button>
                                </div>

                                <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                    <label></label>
                                    <label>SPH</label>
                                    <label>CYL</label>
                                    <label>AXIS</label>
                                    <label>VIS</label>
                                </div>

                                <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">

                                    <label>D.V</label>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.rightEye.sph}
                                            onChange={(e) => handleChange("contactLens", "rightEye", "sph", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "rightEye", "sph", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "rightEye", "sph")}
                                    </div>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.rightEye.cyl}
                                            onChange={(e) => handleChange("contactLens", "rightEye", "cyl", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "rightEye", "cyl", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "rightEye", "cyl")}
                                    </div>

                                    <input className={inputClass} value={prescription.contactLens.rightEye.axis} onChange={(e) => handleChange("contactLens", "rightEye", "axis", e.target.value)} />

                                    <input className={inputClass} value={prescription.contactLens.rightEye.vis} onChange={(e) => handleChange("contactLens", "rightEye", "vis", e.target.value)} />

                                </div>

                                <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 mt-2 items-center text-center">

                                    <label>N.V</label>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.rightEye.nv_sph}
                                            onChange={(e) => handleChange("contactLens", "rightEye", "nv_sph", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "rightEye", "nv_sph", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "rightEye", "nv_sph")}
                                    </div>

                                    <div className="relative">
                                        <input className={inputClass} value={prescription.contactLens.rightEye.nv_cyl}
                                            onChange={(e) => handleChange("contactLens", "rightEye", "nv_cyl", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "rightEye", "nv_cyl", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "rightEye", "nv_cyl")}
                                    </div>

                                    <input className={inputClass} value={prescription.contactLens.rightEye.nv_axis} onChange={(e) => handleChange("contactLens", "rightEye", "nv_axis", e.target.value)} />

                                    <input className={inputClass} value={prescription.contactLens.rightEye.nv_vis} onChange={(e) => handleChange("contactLens", "rightEye", "nv_vis", e.target.value)} />

                                </div>

                                <div className="grid grid-cols-[50px_repeat(1,1fr)] gap-2 mt-2 items-center text-center">

                                    <label>ADD</label>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.rightEye.add}
                                            onChange={(e) => handleChange("contactLens", "rightEye", "add", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "rightEye", "add", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "rightEye", "add")}
                                    </div>

                                </div>
                            </div>

                            {/* LEFT EYE */}
                            <div className="border border-gray-300 rounded-lg p-4">
                                {/* <h3 className="font-semibold mb-3">Left Eye</h3> */}
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold">Left Eye</h3>
                                    <button
                                        type="button"
                                        onClick={() => copyEyeValues(type === "contact" ? "contactLens" : type, "leftEye", "rightEye")}
                                        className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded hover:bg-green-200 cursor-pointer"
                                    >
                                        Copy → Right
                                    </button>
                                </div>

                                <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">
                                    <label></label>
                                    <label>SPH</label>
                                    <label>CYL</label>
                                    <label>AXIS</label>
                                    <label>VIS</label>
                                </div>

                                <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 items-center text-center">

                                    <label>D.V</label>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.leftEye.sph}
                                            onChange={(e) => handleChange("contactLens", "leftEye", "sph", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "leftEye", "sph", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "leftEye", "sph")}
                                    </div>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.leftEye.cyl}
                                            onChange={(e) => handleChange("contactLens", "leftEye", "cyl", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "leftEye", "cyl", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "leftEye", "cyl")}
                                    </div>

                                    <input className={inputClass} value={prescription.contactLens.leftEye.axis} onChange={(e) => handleChange("contactLens", "leftEye", "axis", e.target.value)} />

                                    <input className={inputClass} value={prescription.contactLens.leftEye.vis} onChange={(e) => handleChange("contactLens", "leftEye", "vis", e.target.value)} />

                                </div>

                                <div className="grid grid-cols-[50px_repeat(4,1fr)] gap-2 mt-2 items-center text-center">

                                    <label>N.V</label>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.leftEye.nv_sph}
                                            onChange={(e) => handleChange("contactLens", "leftEye", "nv_sph", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "leftEye", "nv_sph", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "leftEye", "nv_sph")}
                                    </div>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.leftEye.nv_cyl}
                                            onChange={(e) => handleChange("contactLens", "leftEye", "nv_cyl", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "leftEye", "nv_cyl", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "leftEye", "nv_cyl")}
                                    </div>

                                    <input className={inputClass} value={prescription.contactLens.leftEye.nv_axis} onChange={(e) => handleChange("contactLens", "leftEye", "nv_axis", e.target.value)} />

                                    <input className={inputClass} value={prescription.contactLens.leftEye.nv_vis} onChange={(e) => handleChange("contactLens", "leftEye", "nv_vis", e.target.value)} />

                                </div>

                                <div className="grid grid-cols-[50px_repeat(1,1fr)] gap-2 mt-2 items-center text-center">

                                    <label>ADD</label>

                                    <div className="relative">

                                        <input className={inputClass} value={prescription.contactLens.leftEye.add}
                                            onChange={(e) => handleChange("contactLens", "leftEye", "add", e.target.value)}
                                            onBlur={(e) => handleBlurFormat("contactLens", "leftEye", "add", e.target.value)}
                                        />

                                        {renderSuggestions("contactLens", "leftEye", "add")}
                                    </div>

                                </div>
                            </div>

                        </div>
                    </>
                )
            }

        </div >
    );
}
