import { get, post, put, uploadImage } from "@/utils/network";
import { useEffect, useState } from "react";
import BranchSelection from "./addBranch";
import { TimeRange } from "@/utils/types";
import { ERRORS } from "@/utils/errors";
import { Icon } from "@iconify/react/dist/iconify.js";
import { time } from "console";
import { max } from "moment";
import { on } from "events";

// Define interfaces
interface Category {
  id: number;
  type: string;
  name_en: string;
  name_ar: string;
}

interface Branch {
  branch_id: number;
  name_en: string;
  name_ar: string;
  city_en: string;
  city_ar: string;
  latitude: string;
  longitude: string;
  maximum_booking_per_slot: number;
}
interface Service {
  id: number;
  name_ar: string;
  name_en: string;
  about_ar: string;
  about_en: string;
  type: string;
  category_en: string;
  category_ar: string;
  category_id: number;
  actual_price: string;
  discounted_price: string;
  service_image_en_url: string;
  service_image_ar_url: string;
  can_redeem: boolean;
}

interface ServiceFormData {
  id?: number;
  name_ar: string;
  name_en: string;
  about_ar: string;
  about_en: string;
  category_id: number;
  actual_price: string;
  discounted_price: string;
  service_image_en_url: string;
  service_image_ar_url: string;
  can_redeem: boolean;
}

interface Props {
  editData?: Service; // This prop will contain prefilled data when editing
  serviceBranches?: Branch[];
  onSuccess: (service: Service) => void;
}

const AddService = ({ editData, serviceBranches, onSuccess }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number>(-1);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);
  const [updating, setUpdating] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  
  // Form data state
  const [formData, setFormData] = useState<ServiceFormData>({
    name_en: "",
    name_ar: "",
    category_id: 0,
    about_en: "",
    about_ar: "",
    actual_price: "",
    discounted_price: "",
    service_image_en_url: "",
    service_image_ar_url: "",
    can_redeem: false
  });




  // Prefill data when `editData` is available
  useEffect(() => {
    // Set the state
    () => {

    }
    if (serviceBranches && serviceBranches.length > 0) {
      setSelectedBranches(serviceBranches);
    }

    if (editData) {
      setFormData({
        name_en: editData.name_en,
        name_ar: editData.name_ar,
        about_en: editData.about_en,
        category_id: editData.category_id,
        about_ar: editData.about_ar,
        actual_price: editData.actual_price,
        discounted_price: editData.discounted_price,
        can_redeem: editData.can_redeem,
        service_image_en_url: editData.service_image_en_url,
        service_image_ar_url: editData.service_image_ar_url,
      });
    }
    fetchCategories();
  }, [editData, serviceBranches]);


  // Fetch categories
  const fetchCategories = async () => {
    if (categories.length > 0) return;
    setCategoriesLoading(true);
    try {
      const response = await get("/service/category");
      setCategories(Array.isArray(response) ? response : []);
      const category = response.find((category: Category) => category.name_en === editData?.category_en);
      if (category) {
        setSelectedCategory(category.id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "") {
      return;
    }
    formData.category_id = Number(e.target.value);
    setSelectedCategory(Number(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (editData) {
      handleUpdate()
    }
    else {
      handleCreate()
    }
  };


  const handleUpdate = async () => {
    //      name_en: z.string(),
    //     name_ar: z.string(),
    //     category_id: z.number(),
    //     about_en: z.string(),
    //     about_ar: z.string(),
    //     actual_price: z.number(),
    //     discounted_price: z.number(),
    //     category_id: z.integer(),
    //     service_image_en_url: z.string(),
    //     service_image_ar_url: z.string(),
    //     can_redeem: z.boolean().default(false) 
    setUpdating(true);  
    if (!editData) {
      return
    }
    try {
      const data: any = {}
      if (formData.name_en && formData.name_en != editData?.name_en) {
        data.name_en = formData.name_en
      }
      if (formData.name_ar && formData.name_ar != editData?.name_ar) {
        data.name_ar = formData.name_ar
      }
      if (formData.about_ar && formData.about_ar != editData?.about_ar) {
        data.about_ar = formData.about_ar
      }
      if (formData.about_en && formData.about_en != editData?.about_en) {
        data.about_en = formData.about_en
      }
      if (formData.actual_price && formData.actual_price != editData?.actual_price) {
        data.actual_price = parseInt(formData.actual_price)
      }
      if (formData.discounted_price && formData.discounted_price != editData?.discounted_price) {
        data.discounted_price = parseInt(formData.discounted_price)
      }
      if (formData.category_id < 0 && formData.category_id != editData?.category_id) {
        data.category_id = formData
      }
      if (formData.service_image_ar_url && formData.service_image_ar_url != editData?.service_image_ar_url) {
        const imageAR = await uploadImage(formData.service_image_ar_url)
        data.service_image_ar_url = imageAR
      }
      if (formData.service_image_en_url && formData.service_image_en_url != editData?.service_image_en_url) {
        const imageEN = await uploadImage(formData.service_image_en_url)
        data.service_image_en_url = imageEN
      }
      if (formData.can_redeem != editData?.can_redeem) {
        data.can_redeem = formData.can_redeem
      }
      let service = editData
      if (Object.keys(data).length !== 0) {
        service = await put(`/service/${editData?.id}`, data)
      }

      const branches = selectedBranches.map((branch) => ({
        branch_id: branch.branch_id,
        maximum_booking_per_slot: 10
      }))
      

      await put(`/service/branches`, { branches: selectedBranches, service_id: editData?.id });
      
      onSuccess(service);
    } catch (error) {
      console.error("Error updating service:", error);
    } finally {
      setUpdating(false);
    }
  }


  const handleENFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files && e.target.files.length > 0) {
        const src = URL.createObjectURL(e.target.files[0]);
        setFormData((prev) => ({ ...prev, service_image_en_url: src as string }));
      }
    }
  };

  const handleARFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files && e.target.files.length > 0) {
        const src = URL.createObjectURL(e.target.files[0]);
        setFormData((prev) => ({ ...prev, service_image_ar_url: src as string }));
      }
    }
  };
  const handleARRemoveImage = () => {
    setFormData(prev => ({ ...prev, service_image_ar_url: "" }));
  };
  const handleENRemoveImage = () => {
    setFormData(prev => ({ ...prev, service_image_en_url: "" }));
  };
  const handleCreate = async () => {
    setCreating(true);
    try {
      if (!formData.name_en) {
        throw ERRORS.SERVICE_NAME_EN_REQUIRED
      }
      if (!formData.name_ar) {
        throw ERRORS.SERVICE_NAME_AR_REQUIRED
      }
      if (!formData.about_ar) {
        throw ERRORS.ABOUT_AR_REQUIRED
      }
      if (!formData.about_en) {
        throw ERRORS.ABOUT_EN_REQUIRED
      }
      if (!formData.actual_price) {
        throw ERRORS.ACTUAL_PRICE_REQUIRED
      }
      if (!formData.discounted_price) {
        throw ERRORS.DISCOUNTED_PRICE_REQUIRED
      }
      if (formData.category_id < 0) {
        throw ERRORS.CATEGORY_ID_REQUIRED
      }
      if (!formData.service_image_ar_url) {
        throw ERRORS.SERVICE_IMAGE_AR_REQUIRED
      }
      if (!formData.service_image_en_url) {
        throw ERRORS.SERVICE_IMAGE_EN_REQUIRED
      }

      if (selectedBranches.length === 0) {
        throw ERRORS.BRANCH_REQUIRED
      }
      


      const imageEN = await uploadImage(formData.service_image_en_url)
      const imageAR = await uploadImage(formData.service_image_ar_url)

      const data: any = {
        name_en: formData.name_en,
        name_ar: formData.name_ar,
        about_en: formData.about_en,
        about_ar: formData.about_ar,
        actual_price: parseInt(formData.actual_price),
        discounted_price: parseInt(formData.discounted_price),
        category_id: formData.category_id,
        service_image_en_url: imageEN,
        service_image_ar_url: imageAR,
        can_redeem: formData.can_redeem
      }
      const response = await post("/service", data)
      const serviceID = response.id
      
      const branches = selectedBranches.map((branch) => ({
        branch_id: branch.branch_id,
        maximum_booking_per_slot: branch.maximum_booking_per_slot
      }))
      await post(`/service/branches`,
        {
          service_id: serviceID,
          branches: branches
        }
      )
      onSuccess(response);
    } catch (error) {
      console.error("Error creating service:", error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h6 className="card-title mb-0">{editData ? "Edit Service" : "Add Service"}</h6>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          <div>
            <div className="row gy-3">
              <div className="col-12">
                <label className="form-label">Category</label>
                {categoriesLoading ? (
                  <p>Loading categories...</p>
                ) : (
                  <select
                    className="form-control"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name_en}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="row mt-4">
                <div className="col">
                  <label className="form-label">Service Name (English)</label>
                  <input type="text" name="name_en" className="form-control" value={formData.name_en} onChange={handleChange} required />
                </div>

                <div className="col">
                  <label className="form-label">Service Name (Arabic)</label>
                  <input type="text" name="name_ar" className="form-control" value={formData.name_ar} onChange={handleChange} required />
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">About (English)</label>
                <input type="text" name="about_en" step="0.01" className="form-control" value={formData.about_en} onChange={handleChange} required />
              </div>

              <div className="col-12">
                <label className="form-label">About (Arabic)</label>
                <input type="text" name="about_ar" step="0.01" className="form-control" value={formData.about_ar} onChange={handleChange} required />
              </div>
              <div className="row mt-4">
                <div className="col">
                  <label className="form-label">Actual Price</label>
                  <input type="number" name="actual_price" step="0.01" className="form-control" value={formData.actual_price} onChange={handleChange} required />
                </div>

                <div className="col">
                  <label className="form-label">Discounted Price</label>
                  <input type="number" name="discounted_price" step="0.01" className="form-control" value={formData.discounted_price} onChange={handleChange} />
                </div>
              </div>
              <div className="col-12">
                <div className="form-check d-flex align-items-center" style={{ minHeight: '30px' }}>
                  <input
                    type="checkbox"
                    id="can_redeem"
                    name="can_redeem"
                    className="form-check-input"
                    checked={formData.can_redeem || false}
                    onChange={handleChange}
                  />
                  <label className="form-check-label mx-3" htmlFor="can_redeem">
                    Can Redeem
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div className="col-md-6">
                <label className="form-label fw-bold text-neutral-900">
                  English Thumbnail (Max Size 2Mb)
                </label>
                <div className="upload-image-wrapper">
                  {formData.service_image_en_url ? (
                    <div className="uploaded-img position-relative h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50">
                      <button
                        type="button"
                        onClick={handleENRemoveImage}
                        className="uploaded-img__remove position-absolute top-0 end-0 z-1 text-2xxl line-height-1 me-8 mt-8 d-flex"
                        aria-label="Remove uploaded image"
                      >
                        <Icon
                          icon="radix-icons:cross-2"
                          className="text-xl text-danger-600"
                        ></Icon>
                      </button>
                      <img
                        id="uploaded-img__preview"
                        className="w-100 h-100 object-fit-cover"
                        src={formData.service_image_en_url}
                        alt="Uploaded"
                      />
                    </div>
                  ) : (
                    <label
                      className="upload-file h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50 bg-hover-neutral-200 d-flex align-items-center flex-column justify-content-center gap-1"
                      htmlFor="upload-file-1"
                    >
                      <Icon
                        icon="solar:camera-outline"
                        className="text-xl text-secondary-light"
                      ></Icon>
                      <span className="fw-semibold text-secondary-light">
                        Upload
                      </span>
                      <input
                        id="upload-file-1"
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleENFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-neutral-900">
                  Arabic Thumbnail (Max Size 2Mb)
                </label>
                <div className="upload-image-wrapper">
                  {formData.service_image_ar_url ? (
                    <div className="uploaded-img position-relative h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50">
                      <button
                        type="button"
                        onClick={handleARRemoveImage}
                        className="uploaded-img__remove position-absolute top-0 end-0 z-1 text-2xxl line-height-1 me-8 mt-8 d-flex"
                        aria-label="Remove uploaded image"
                      >
                        <Icon
                          icon="radix-icons:cross-2"
                          className="text-xl text-danger-600"
                        ></Icon>
                      </button>
                      <img
                        id="uploaded-img__preview"
                        className="w-100 h-100 object-fit-cover"
                        src={formData.service_image_ar_url}
                        alt="Uploaded"
                      />
                    </div>
                  ) : (
                    <label
                      className="upload-file h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50 bg-hover-neutral-200 d-flex align-items-center flex-column justify-content-center gap-1"
                      htmlFor="upload-file"
                    >
                      <Icon
                        icon="solar:camera-outline"
                        className="text-xl text-secondary-light"
                      ></Icon>
                      <span className="fw-semibold text-secondary-light">
                        Upload
                      </span>
                      <input
                        id="upload-file"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleARFileChange}
                      />
                    </label>
                  )}

                </div>
              </div>


              {/* Branch Selection */}
              <BranchSelection selectedBranches={selectedBranches} setSelectedBranches={setSelectedBranches} />

              {/* Submit Button */}
              <div className="col-12">
                <button onClick={handleSubmit} className="btn btn-primary" disabled={updating || creating}>
                  {editData ? (updating ? "Updating..." : "Update Service") : (creating ? "Creating..." : "Add Service")}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddService;
