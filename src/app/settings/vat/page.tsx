"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchVat, updateVat } from "./actions";
import { STATE } from "./state";
import { Icon } from "@iconify/react";

export default function VatSettingsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { vat, loading, error } = useSelector((state: RootState) => state.vat);
    const [newVat, setNewVat] = useState<number | "">(vat || "");

    useEffect(() => {
        dispatch(fetchVat());
    }, [dispatch]);

    useEffect(() => {
        if (vat) {
            setNewVat(vat);
        }
    }, [vat]);

    const handleUpdateVat = async () => {
        if (newVat === "" || isNaN(Number(newVat)) || newVat < 0) return;
        dispatch(updateVat(Number(newVat)));
    };

    return (
        <div className="container py-24">
            <div className="row">
                <div className="col-xxl-3 col-sm-6">
                    <div className="card h-100 radius-12 text-center shadow-md">
                        <div className="card-body p-24">
                            <div className="w-64-px h-64-px d-inline-flex align-items-center justify-content-center bg-gradient-primary text-primary-600 mb-16 radius-12">
                                <Icon icon="ri:percent-fill" className="h5 mb-0" />
                            </div>
                            <h6 className="mb-8">VAT Percentage</h6>
                            {loading === STATE.LOADING ? (
                                <p className="text-secondary-light">Loading VAT details...</p>
                            ) : error ? (
                                <p className="text-danger">{error}</p>
                            ) : (
                                <p className="card-text mb-8 text-secondary-light">
                                    Current VAT: <strong>{vat || "Not Set"}</strong>%
                                </p>
                            )}

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateVat();
                                }}
                                className="mt-12"
                            >
                                <div className="input-group mb-12">
                                    <input
                                        type="number"
                                        className="form-control radius-12 border-1 px-12 py-8 shadow-sm"
                                        placeholder="Enter new VAT"
                                        value={newVat}
                                        onChange={(e) => setNewVat(e.target.value as number | "")}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn bg-primary text-white px-20 py-8 radius-12 hover-bg-primary-dark"
                                        disabled={loading === STATE.LOADING}
                                    >
                                        {loading === STATE.LOADING ? "Updating..." : "Update"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

