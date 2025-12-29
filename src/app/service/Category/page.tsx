'use client';

import React, { useEffect, useState } from 'react';
import { get } from '@/utils/network';
import Image from 'next/image';
import { Icon } from '@iconify/react/dist/iconify.js';
import Modal from 'react-bootstrap/Modal';
import AddCategory from './addCategory';
import Link from 'next/link';
import UpdateCategory from './updateCategory';
import { Category } from '@/utils/types';



const CategoryPage = () => {
  const [showCreateCategoryModel, setShowCreateCategoryModel] = useState(false);
  const [showEditCategoryModel, setShowEditCategoryModel] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const onSuccessCreate = (category: Category) => {
    setCategories((state) => [...state, category]);
    setShowCreateCategoryModel(false);
  }

  const onUpdatedCategory = (category: Category) => {
    setCategories((state) => state.map((c) => c.id === category.id ? category : c));
    setShowEditCategoryModel(false);
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await get('/service/category'); // Replace with your actual API endpoint
        setCategories(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleEditCategory = async (categoryId: number) => {

    const categoryToEdit = categories.find((categories) => categories.id === categoryId);
    console.log(categoryToEdit)
    if (!categoryToEdit) {
      console.error('Service not found in state!');
      return;
    }
    setSelectedCategory(categoryToEdit);
    setShowEditCategoryModel(true);
  }

  return (
    <div className="card h-100 p-0 rounded-3 border border-neutral-200 dark:border-neutral-600 shadow-sm">
      {/* Header Section */}
      <div className="card-header bg-base border-bottom border-neutral-200 dark:border-neutral-600 py-3 px-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 className="h4 fw-bold mb-1 text-neutral-900 dark:text-neutral-100">Available Categories</h1>
            <p className="text-secondary-light mb-0 small">
              <Icon icon="mdi:tag-multiple" className="me-1" />
              Manage your service categories
            </p>
          </div>
          <button
            onClick={() => { setShowCreateCategoryModel(true) }}
            className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
            aria-label="Add new category"
          >
            <Icon icon="ic:baseline-plus" className="fs-5" />
            <span className="d-none d-sm-inline">Add Category</span>
          </button>
        </div>
      </div>


      {/* Create Category Modal */}
      <Modal show={showCreateCategoryModel} size="lg" onHide={() => setShowCreateCategoryModel(false)} centered>
        <Modal.Header closeButton className="bg-base border-bottom border-neutral-200 dark:border-neutral-600">
          <Modal.Title className="d-flex align-items-center gap-2 text-neutral-900 dark:text-neutral-100">
            <Icon icon="mdi:tag-plus" className="text-primary" />
            Register New Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-base">
          <AddCategory onSuccess={onSuccessCreate} />
        </Modal.Body>
      </Modal>

      {/* Edit Category Modal */}
      <Modal show={showEditCategoryModel} size="lg" onHide={() => setShowEditCategoryModel(false)} centered>
        <Modal.Header closeButton className="bg-base border-bottom border-neutral-200 dark:border-neutral-600">
          <Modal.Title className="d-flex align-items-center gap-2 text-neutral-900 dark:text-neutral-100">
            <Icon icon="mdi:pencil" className="text-primary" />
            Edit Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-base">
          <UpdateCategory onSuccess={onUpdatedCategory} editData={selectedCategory} />
        </Modal.Body>
      </Modal>

      {/* Content Section */}
      <div className="card-body p-4 bg-base">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-secondary-light mb-0">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-0" role="alert">
            <Icon icon="mdi:alert-circle" className="fs-4" />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5">
            <Icon icon="mdi:folder-open-outline" className="fs-1 text-neutral-400 mb-3" />
            <p className="text-secondary-light mb-0">No categories found. Create your first category to get started.</p>
          </div>
        ) : (
          <div className="row g-4">
            {categories.map((categories: any) => (
              <CategoryCard key={categories.id} category={categories} onEdit={() => handleEditCategory(categories.id)} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, onEdit }: { category: any; onEdit: () => void }) => {

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-3">
      <style jsx>{`
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        [data-bs-theme="dark"] .card:hover {
          box-shadow: 0 0.5rem 1rem rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>
      <div className="card h-100 border border-neutral-200 dark:border-neutral-600 shadow-sm rounded-3 overflow-hidden bg-base">
        {/* Category Image */}
        <div className="position-relative" style={{ height: "180px" }}>
          <img
            src={category.image_en}
            alt={category.name_en}
            className="w-100 h-100 object-fit-cover"
            loading="lazy"
          />
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-primary bg-opacity-90">
              <Icon icon="mdi:tag" className="me-1" />
              Category
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body d-flex flex-column p-3 bg-base">
          {/* Category Names */}
          <div className="text-center mb-3 flex-grow-1">
            <h5 className="fw-bold mb-2 text-neutral-900 dark:text-neutral-100">{category.name_en}</h5>
            <p className="text-secondary-light mb-0 small" dir="rtl">{category.name_ar}</p>
          </div>

          {/* Edit Button */}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center gap-2 w-100"
            aria-label={`Edit ${category.name_en}`}
          >
            <Icon icon="mdi:pencil" className="fs-6" />
            Edit Category
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
