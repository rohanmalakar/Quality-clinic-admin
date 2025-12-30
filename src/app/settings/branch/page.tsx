"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { addBranch, deleteBranch, fetchBranch, updateBranch } from "./actions";
import { clearError } from "./store";
import { STATE } from "./state";
import { ERRORS } from "@/utils/errors";
import { toast } from 'react-toastify';
import Modal from 'react-bootstrap/Modal';

export default function BranchSettingsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { branches, loading, error } = useSelector((state: RootState) => state.branch);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name_ar: "",
        name_en: "",
        city_en: "",
        city_ar: "",
        latitude: "",
        longitude: "",
    });

    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchBranch());
    }, [dispatch]);

    // Watch for errors from Redux store
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: "top-right",
                autoClose: 5000,
            });
            // Clear error after showing
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdate = async () => {
        // Validate all fields are filled
        if (!formData.name_ar || !formData.name_en || !formData.city_en || !formData.city_ar) {
            toast.error(ERRORS.FORM_NOT_FILLED.message, {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        // Validate latitude and longitude are provided
        if (!formData.latitude || !formData.longitude) {
            toast.error(ERRORS.FORM_NOT_FILLED.message, {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        // Validate latitude and longitude are valid numbers
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            toast.error(ERRORS.LANG_LAT_NOT_NUMBER.message, {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        // Validate latitude is within valid range (-90 to 90)
        if (lat < -90 || lat > 90) {
            toast.error('Latitude must be between -90 and 90', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        // Validate longitude is within valid range (-180 to 180)
        if (lng < -180 || lng > 180) {
            toast.error('Longitude must be between -180 and 180', {
                position: "top-right",
                autoClose: 5000,
            });
            return;
        }

        const branch = {
            name_ar: formData.name_ar,
            name_en: formData.name_en,
            city_en: formData.city_en,
            city_ar: formData.city_ar,
            latitude: lat,
            longitude: lng,
        };

        try {
            if (editId) {
                await dispatch(updateBranch({ id: editId, ...branch })).unwrap();
                toast.success('Branch updated successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                await dispatch(addBranch(branch)).unwrap();
                toast.success('Branch added successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                });
            }

            setFormData({
                name_ar: "",
                name_en: "",
                city_en: "",
                city_ar: "",
                latitude: "",
                longitude: "",
            });
            setEditId(null);
            setShowModal(false);
        } catch (error: any) {
            // Error will be handled by useEffect watching Redux store error
        }
    };

    const handleOpenAddModal = () => {
        setFormData({
            name_ar: "",
            name_en: "",
            city_en: "",
            city_ar: "",
            latitude: "",
            longitude: "",
        });
        setEditId(null);
        setShowModal(true);
    };

    const handleEdit = (branch: any) => {
        setFormData({
            name_ar: branch.name_ar,
            name_en: branch.name_en,
            city_en: branch.city_en,
            city_ar: branch.city_ar,
            latitude: branch.latitude.toString(),
            longitude: branch.longitude.toString(),
        });
        setEditId(branch.id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            name_ar: "",
            name_en: "",
            city_en: "",
            city_ar: "",
            latitude: "",
            longitude: "",
        });
        setEditId(null);
    };

    const handleDelete = async (branchId: number) => {
        if (!confirm('Are you sure you want to delete this branch?')) {
            return;
        }

        try {
            await dispatch(deleteBranch(branchId)).unwrap();
            toast.success('Branch deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error: any) {
            // Error will be handled by useEffect watching Redux store error
        }
    };

    if (loading === STATE.LOADING) {
        return <div>Loading...</div>;
    }

    if (loading === STATE.ERROR) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="container py-4">
            {/* Branch List Card */}
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Branch Management</h5>
                    <button
                        onClick={handleOpenAddModal}
                        className="btn btn-primary"
                    >
                        <i className="ri-add-line me-2"></i>
                        Add New Branch
                    </button>
                </div>
                <div className="card-body">
                    <div className="row g-4">
                        {branches.map((branch) => (
                            <div key={branch.id} className="col-12 col-sm-6 col-lg-4">
                                <div className="card h-100 shadow-sm border">
                                    {/* Header */}
                                    <div className="card-header d-flex justify-content-between align-items-center  text-white">
                                        <h6 className="mb-0 fw-semibold text-truncate">
                                            <i className="ri-building-line me-2"></i>
                                            {branch.name_en}
                                        </h6>
                                        <span className="badge bg-light text-dark fw-medium">
                                            ID: {branch.id}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="card-body">

                                        {/* Names */}
                                        <div className="mb-3">
                                            <div className="d-flex gap-2 mb-2">
                                                <i className="ri-global-line text-primary mt-1"></i>
                                                <div>
                                                    <small className="">English Name</small>
                                                    <div className="fw-semibold text-break">
                                                        {branch.name_en}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <i className="ri-translate text-warning mt-1"></i>
                                                <div>
                                                    <small className="">Arabic Name</small>
                                                    <div className="fw-semibold text-break">
                                                        {branch.name_ar}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* City */}
                                        <div className="mb-3">
                                            <div className="d-flex gap-2 mb-2">
                                                <i className="ri-map-pin-line text-success mt-1"></i>
                                                <div>
                                                    <small className="">City (EN)</small>
                                                    <div>{branch.city_en}</div>
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2">
                                                <i className="ri-map-pin-fill text-success mt-1"></i>
                                                <div>
                                                    <small className="">City (AR)</small>
                                                    <div>{branch.city_ar}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Coordinates */}
                                        <div className="border-top pt-3">
                                            <div className="row text-center">
                                                <div className="col-6">
                                                    <small className=" d-block">Latitude</small>
                                                    <span className="fw-semibold">{branch.latitude}</span>
                                                </div>
                                                <div className="col-6">
                                                    <small className="d-block">Longitude</small>
                                                    <span className="fw-semibold">{branch.longitude}</span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Footer */}
                                    <div className="card-footer border-top d-flex gap-2">
                                        <button
                                            onClick={() => handleEdit(branch)}
                                            className="btn opacity-75 btn-warning btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                                        >
                                            <i className="ri-edit-line"></i>
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(branch.id)}
                                            className="btn opacity-75 btn-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                                        >
                                            <i className="ri-delete-bin-line"></i>
                                            Delete
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>


                    {branches.length === 0 && (
                        <div className="text-center py-5">
                            <i className="ri-building-line text-muted" style={{ fontSize: '48px' }}></i>
                            <p className="text-muted mt-3">No branches found. Click "Add New Branch" to create one.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Branch Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editId ? "Update Branch" : "Add New Branch"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">
                                Name (English) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                name="name_en"
                                value={formData.name_en}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter English name"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                Name (Arabic) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                name="name_ar"
                                value={formData.name_ar}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Arabic name"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                City (English) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                name="city_en"
                                value={formData.city_en}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter English city"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                City (Arabic) <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                name="city_ar"
                                value={formData.city_ar}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter Arabic city"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                Latitude <span className="text-danger">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="latitude"
                                value={formData.latitude}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter latitude"
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                Longitude <span className="text-danger">*</span>
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Enter longitude"
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        onClick={handleCloseModal}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddOrUpdate}
                        className="btn btn-primary"
                    >
                        {editId ? "Update Branch" : "Add Branch"}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

