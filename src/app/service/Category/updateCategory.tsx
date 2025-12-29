import { useEffect, useState } from "react";
import { get, post, put, uploadImage } from "@/utils/network";
import { ERRORS } from "@/utils/errors";
import { Category } from "@/utils/types";
import { Icon } from "@iconify/react/dist/iconify.js";

interface Props {
  editData: Category | null | undefined;
  onSuccess: (category: Category) => void;
}

const UpdateCategory = ({ editData, onSuccess }: Props) => {
  const [formData, setFormData] = useState<Category>({
    name_en: "",
    name_ar: "",
    type: "",
    image_en: "",
    image_ar: "",
  });

  useEffect(() => {
    if (!editData) return;
    setFormData({
      name_en: editData.name_en,
      name_ar: editData.name_ar,
      type: editData.type,
      image_en: editData.image_en,
      image_ar: editData.image_ar,
    });
  }, [editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleENFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files && e.target.files.length > 0) {
        const src = URL.createObjectURL(e.target.files[0]);
        setFormData((prev) => ({ ...prev, image_en: src as string }));
      }
    }
  };

  const handleARFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files && e.target.files.length > 0) {
        const src = URL.createObjectURL(e.target.files[0]);
        setFormData((prev) => ({ ...prev, image_ar: src as string }));
      }
    }
  };
  const handleARRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_ar: "" }));
  };
  const handleENRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_en: "" }));
  }
  const handleSubmit = async () => {
    try  {
      if(!editData) {
        return
      }
      let data: any = {}
      if (formData.name_en && formData.name_en != editData.name_en) {
        data.name_en = formData.name_en
      }
      if (formData.name_ar && formData.name_ar != editData.name_ar) {
        data.name_ar = formData.name_ar
      }
      if (formData.type && formData.type != editData.type) {
        data.type = formData.type
      }
      if (formData.image_en && formData.image_en != editData.image_en) {
        const imageURL = await uploadImage(formData.image_en)
        data.image_en = imageURL
      }
      if (formData.image_ar && formData.image_ar != editData.image_ar) {
        const imageURL = await uploadImage(formData.image_ar)
        data.image_ar = imageURL
      }
      if (Object.keys(data).length === 0) {
        throw ERRORS.NO_CHANGES
      }
      const category =  await put(`/service/category/${editData.id}`, data);
      onSuccess(category)
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
 
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">{editData ? "Edit Category" : "Add Category"}</h6>
      </div>
      <div className="card-body">
        <div>
          <div className="row gy-3">
          <div className="col-12">
                  <label className="form-label">Category</label>
    <select 
      className="form-control"
      name="type"
      onChange={handleChange}
      value={formData.type}
    >
      <option value="">Select a category</option>
      <option value="DENTIST">Dentist</option>
      <option value="DERMATOLOGIST">Dermatology</option>
    </select>
  

        </div>

            <div className="col-12">
              <label className="form-label">Category Name (English)</label>
              <input type="text" name="name_en" className="form-control" value={formData.name_en} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">Category Name (Arabic)</label>
              <input type="text" name="name_ar" className="form-control" value={formData.name_ar} onChange={handleChange} required />
              </div>
           <div className="row">
                       <div className="col-md-6">
                             <label className="form-label fw-bold text-neutral-900">
                                         English Thumbnail
                                       </label>
                                       <div className="upload-image-wrapper">
                                         {formData.image_en ? (
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
                                               src={formData.image_en}
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
                           Arabic Thumbnail
                         </label>
                         <div className="upload-image-wrapper">
                           {formData.image_ar ? (
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
                                 src={formData.image_ar}
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
                       </div>
            <div className="col-12">
              <button onClick={handleSubmit} className="btn btn-primary">
                {editData ? "Update Category" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateCategory;