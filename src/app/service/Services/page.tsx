'use client';

import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Icon } from '@iconify/react/dist/iconify.js';
import AddService from './addService';
import { del, get } from '@/utils/network';

const ServicePage = () => {
  const [showCreateServiceModel, setShowCreateServiceModel] = useState(false);
  const [showEditServiceModel, setShowEditServiceModel] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [services, setService] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceBranches, setServiceBranches] = useState<any>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await get('/service');
        setService(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleCardClick = (service: any) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleEditService = async (serviceId: number) => {
    
    const branch = await get(`/branch/service?service_id=${serviceId}`);

    setServiceBranches(branch);
    const serviceToEdit = services.find((service) => service.id === serviceId);
    if (!serviceToEdit) {
      return;
    }
    setSelectedService(serviceToEdit);
    setShowDetailsModal(false);
    setShowEditServiceModel(true);
  };

  const onSuccessServiceCreate = (service: any) => {
    setService((state) => [...state, service]);
    setShowCreateServiceModel(false);
  };

  const onSuccessServiceEdit = (service: any) => {
    setService((state) => state.map((s) => (s.id === service.id ? service : s)));
    setShowEditServiceModel(false);
  };

  const handleServiceDelete = async (serviceId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this service?');
    if (!confirmed) return;

    try {
      await del(`/service/${serviceId}`);
      setService((state) => state.filter((service) => service.id !== serviceId));
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
    }
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <h1 className="text-xl fw-semibold mb-0">Available Services</h1>
          <span className="badge bg-primary-600 text-white px-12 py-6 radius-4 fw-medium">
            {services.length} {services.length === 1 ? 'Service' : 'Services'}
          </span>
        </div>
        <button
          onClick={() => setShowCreateServiceModel(true)}
          className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
        >
          <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
          Add New Service
        </button>
      </div>

      {/* Create Service Modal */}
      <Modal show={showCreateServiceModel} size="lg" onHide={() => setShowCreateServiceModel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Register New Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddService onSuccess={onSuccessServiceCreate} />
        </Modal.Body>
      </Modal>

      {/* Edit Service Modal */}
      <Modal show={showEditServiceModel} size="lg" onHide={() => setShowEditServiceModel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddService
            onSuccess={onSuccessServiceEdit}
            editData={selectedService}
            serviceBranches={serviceBranches}
          />
        </Modal.Body>
      </Modal>

      {/* Service Details Modal */}
      <Modal show={showDetailsModal} size="xl" onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton className="border-bottom bg-base">
          <Modal.Title className="fw-semibold text-neutral-900 dark:text-neutral-100">Service Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-20 bg-base">
          {selectedService && (
            <div className="service-details">
              {/* Service Image */}
              <div className="position-relative mb-20 radius-12 overflow-hidden shadow-sm">
                <img
                  src={selectedService.service_image_en_url}
                  alt={selectedService.name_en}
                  className="w-100"
                  style={{ height: '280px', objectFit: 'cover' }}
                />
                <div className="position-absolute top-0 end-0 m-12">
                  <span className="badge bg-primary-600 text-white px-12 py-6 fs-13 fw-semibold radius-4">
                    {selectedService.type}
                  </span>
                </div>
              </div>

              {/* Service Names Section */}
              <div className="card bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 mb-16">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-12">
                  <div className="flex-grow-1">
                    <h4 className="fw-bold mb-2 text-neutral-900 dark:text-neutral-100">{selectedService.name_en}</h4>
                    <h5 className="fw-semibold mb-0 text-neutral-600 dark:text-neutral-300 fs-16" dir="rtl">
                      {selectedService.name_ar}
                    </h5>
                  </div>
                  {selectedService.can_redeem === 1 && (
                    <span className="badge bg-warning-600 text-white px-12 py-8 radius-4 fw-semibold">
                      <Icon icon="mdi:gift" className="me-1" />
                      Redeemable
                    </span>
                  )}
                </div>
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className=" bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 h-100 d-flex align-items-start gap-2">
                      <Icon icon="material-symbols:category" className="text-primary-600 fs-5" />
                      <div>
                        <small className="text-secondary-light d-block fs-11">Category (EN)</small>
                        <span className="fw-medium text-neutral-900 dark:text-neutral-100 fs-14">
                          {selectedService.category_en}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 h-100 d-flex align-items-start gap-2" dir="rtl">
                      <Icon icon="material-symbols:category" className="text-primary-600 fs-5" />
                      <div>
                        <small className="text-secondary-light d-block fs-11">الفئة (AR)</small>
                        <span className="fw-medium text-neutral-900 dark:text-neutral-100 fs-14">
                          {selectedService.category_ar}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions Section */}
              <div className="row g-3 mb-16">
                <div className="col-md-6">
                  <div className="card bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 h-100">
                    <h6 className="fw-semibold mb-12 text-neutral-700 dark:text-neutral-200 d-flex align-items-center gap-2">
                      <Icon icon="mdi:file-document-outline" className="text-primary-600" />
                      Description (English)
                    </h6>
                    <p className="text-secondary-light mb-0 fs-14 lh-lg">{selectedService.about_en}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 h-100">
                    <h6 className="fw-semibold mb-12 text-neutral-700 dark:text-neutral-200 d-flex align-items-center gap-2" dir="rtl">
                      <Icon icon="mdi:file-document-outline" className="text-primary-600" />
                      الوصف (عربي)
                    </h6>
                    <p className="text-secondary-light mb-0 fs-14 lh-lg" dir="rtl">{selectedService.about_ar}</p>
                  </div>
                </div>
              </div>

              {/* Service Information Grid */}
              <div className="row g-3 mb-16">
                <div className="col-md-4">
                  <div className="card bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 h-100 text-center">
                    <Icon icon="mdi:tag-outline" className="text-primary-600 fs-1 mb-8 mx-auto" />
                    <small className="text-secondary-light d-block mb-4 fs-12">Service Type</small>
                    <span className="fw-bold text-neutral-900 dark:text-neutral-100 fs-15">
                      {selectedService.type}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 h-100 text-center">
                    <Icon icon="mdi:identifier" className="text-primary-600 fs-1 mb-8 mx-auto" />
                    <small className="text-secondary-light d-block mb-4 fs-12">Service ID</small>
                    <span className="fw-bold text-neutral-900 dark:text-neutral-100 fs-15">
                      #{selectedService.id}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 p-16 radius-8 h-100 text-center">
                    <Icon icon="mdi:gift" className="text-primary-600 fs-1 mb-8 mx-auto" />
                    <small className="text-secondary-light d-block mb-4 fs-12">Loyalty Status</small>
                    <span className="fw-bold text-neutral-900 dark:text-neutral-100 fs-15">
                      {selectedService.can_redeem === 1 ? 'Can Redeem' : 'Not Redeemable'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="card bg-gradient-primary-subtle dark:bg-neutral-700 border border-primary-200 dark:border-neutral-600 p-20 radius-12 mb-20">
                <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                  <div>
                    <h6 className="fw-semibold mb-8 text-neutral-700 dark:text-neutral-200 d-flex align-items-center gap-2">
                      <Icon icon="mdi:cash" className="text-primary-600" />
                      Pricing Information
                    </h6>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      {selectedService.actual_price && selectedService.actual_price !== selectedService.discounted_price && (
                        <div className="text-decoration-line-through text-neutral-400 fs-18">
                          <img
                            src="/assets/symbols/Riyal.png"
                            alt="SAR"
                            style={{ width: '16px', height: 'auto', marginRight: '4px', verticalAlign: 'middle' }}
                          />
                          {selectedService.actual_price}
                        </div>
                      )}
                      <div className="fw-bold text-success-600 fs-32">
                        <img
                          src="/assets/symbols/Riyal.png"
                          alt="SAR"
                          style={{ width: '20px', height: 'auto', marginRight: '6px', verticalAlign: 'middle' }}
                        />
                        {selectedService.discounted_price}
                      </div>
                    </div>
                  </div>
                  {selectedService.actual_price && 
                   selectedService.actual_price !== selectedService.discounted_price && 
                   parseFloat(selectedService.actual_price) > parseFloat(selectedService.discounted_price) && (
                    <div className="text-center">
                      <span className="badge bg-success-600 text-white px-16 py-10 radius-6 fw-bold fs-16">
                        Save {Math.round(
                          ((parseFloat(selectedService.actual_price) - parseFloat(selectedService.discounted_price)) /
                            parseFloat(selectedService.actual_price)) *
                            100
                        )}%
                      </span>
                      <small className="d-block text-secondary-light mt-4 fs-12">Discount Applied</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3 mt-24">
                <button
                  onClick={() => handleEditService(selectedService.id)}
                  className="btn btn-primary flex-grow-1 px-20 py-12 radius-8 d-flex align-items-center justify-content-center gap-2"
                >
                  <Icon icon="lucide:edit" className="text-xl" />
                  Edit Service
                </button>
                <button
                  onClick={() => handleServiceDelete(selectedService.id)}
                  className="btn btn-danger flex-grow-1 px-20 py-12 radius-8 d-flex align-items-center justify-content-center gap-2"
                >
                  <Icon icon="fluent:delete-24-regular" className="text-xl" />
                  Delete Service
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Service Cards */}
      <div className="card-body p-24">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary-light mt-3">Loading services...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center" role="alert">
            <Icon icon="mdi:alert-circle" className="fs-3 me-2" />
            Error: {error}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-5">
            <Icon icon="material-symbols:inbox" className="fs-1 text-neutral-400 mb-3" />
            <p className="text-secondary-light">No services found. Create your first service!</p>
          </div>
        ) : (
          <div className="row gy-4">
            {services.map((service: any) => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={() => handleCardClick(service)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Service Card Component
const ServiceCard = ({ service, onClick }: { service: any; onClick: () => void }) => {
  return (
    <div className="col-xxl-3 col-lg-4 col-md-6 col-sm-12">
      <div
        onClick={onClick}
        className="card h-100 radius-12 overflow-hidden border border-neutral-200 dark:border-neutral-600 transition-all cursor-pointer"
        style={{
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Card Header with Image */}
        <div className="position-relative">
          <img
            src={service.service_image_en_url}
            alt={service.name_en}
            className="w-100"
            style={{ height: '200px', objectFit: 'cover' }}
          />
          <div className="position-absolute top-0 end-0 m-12">
            <span className="badge bg-primary-600 text-white px-12 py-6 fs-12 fw-semibold radius-4 shadow-sm">
              {service.type}
            </span>
          </div>
          {/* Overlay on hover */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              background: 'rgba(0,0,0,0.5)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
          >
            <div className="text-white text-center">
              <Icon icon="mdi:eye" className="fs-1 mb-2" />
              <p className="mb-0 fw-medium">Click to view details</p>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body p-20">
          {/* Service Name and Category */}
          <div className="mb-12">
            <h5 className="fw-semibold mb-8 text-neutral-900 dark:text-neutral-100">{service.name_en}</h5>
            <div className="d-flex align-items-center">
              <Icon icon="material-symbols:category" className="text-neutral-400 me-2" />
              <span className="text-secondary-light fs-14">{service.category_en}</span>
            </div>
          </div>

          {/* Description */}
          <p
            className="text-secondary-light mb-16 fs-14"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {service.about_en}
          </p>

          {/* Price Section */}
          <div className="d-flex justify-content-between align-items-center pt-12 border-top border-neutral-200 dark:border-neutral-600">
            <div className="price-container">
              {service.actual_price && (
                <div className="text-decoration-line-through text-neutral-400 fs-12 mb-4">
                  <img
                    src="/assets/symbols/Riyal.png"
                    alt="SAR"
                    style={{ width: '12px', height: 'auto', marginRight: '4px', verticalAlign: 'middle' }}
                  />
                  {service.actual_price}
                </div>
              )}
              <div className="fw-bold text-success-600 fs-20">
                <img
                  src="/assets/symbols/Riyal.png"
                  alt="SAR"
                  style={{ width: '14px', height: 'auto', marginRight: '4px', verticalAlign: 'middle' }}
                />
                {service.discounted_price}
              </div>
            </div>
            <div className="text-primary-600">
              <Icon icon="solar:arrow-right-outline" className="fs-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
