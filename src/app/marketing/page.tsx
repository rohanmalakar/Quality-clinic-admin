"use client";
import { useEffect, useRef, useState } from "react";
import "highlight.js/styles/github.css";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { 
  Calendar, 
  Camera, 
  X, 
  Plus, 
  Link as LinkIcon,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Modal from 'react-bootstrap/Modal';
import { ERRORS } from "@/utils/errors";
import { del, get, post, uploadImage } from "@/utils/network";
import Link from "next/link";
import * as yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

interface DatePickerProps {
  id: string;
  placeholder: string;
  onChange: (date: Date) => void,
};

const DatePicker: React.FC<DatePickerProps> = ({ id, placeholder, onChange }) => {
  const datePickerRef = useRef(null);

  useEffect(() => {
    // @ts-ignore
    flatpickr(datePickerRef.current, {
      enableTime: true,
      dateFormat: "d/m/Y H:i",
      onChange: (e) => {onChange(e[0])},
    });
  }, []);

  return (
    <input
      ref={datePickerRef}
      id={id}
      type="text"
      className="form-control radius-8 bg-base"
      placeholder={placeholder}
    />
  );
};

interface AddNewBannerProps {
  onSuccess: (banner: Banner) => void;
}
// Create validation schema
const bannerSchema = yup.object().shape({
  link: yup.string().required('Link is required').url('Must be a valid URL'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  enImage: yup.mixed().required('English image is required'),
  arImage: yup.mixed().required('Arabic image is required'),
});

const AddNewBanner: React.FC<AddNewBannerProps> = ({ onSuccess }) => {

  const [enImagePreview, setENImagePreview] = useState<string | null >(null);
  const [arImagePreview, setARImagePreview] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [link, setLink] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const handleENFileChange = (e: any) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const src = URL.createObjectURL(e.target.files[0]);
  //     setENImagePreview(src);
  //   }
  // };
  const handleENFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({...prev, enImage: 'File size must be less than 2MB'}));
        return;
      }
      
      const src = URL.createObjectURL(file);
      setENImagePreview(src);
      setErrors(prev => ({...prev, enImage: ''}));
    }
  };

  // const handleARFileChange = (e: any) => {
  //   if (e.target.files && e.target.files.length > 0) {
  //     const src = URL.createObjectURL(e.target.files[0]);
  //     setARImagePreview(src);
  //   }
  // };
  const handleARFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({...prev, arImage: 'File size must be less than 2MB'}));
        return;
      }
      
      const src = URL.createObjectURL(file);
      setARImagePreview(src);
      setErrors(prev => ({...prev, arImage: ''}));
    }
  };

  // const handleSubmit = async () => {
  //   try {
  //     if (!startDate) {
  //       throw ERRORS.START_DATE_REQUIRED;
  //     }
  //     if (!endDate) {
  //       throw ERRORS.END_DATE_REQUIRED;
  //     }
  //     if (!enImagePreview) {
  //       throw ERRORS.EN_IMAGE_REQUIRED;
  //     }
  //     if (!arImagePreview) {
  //       throw ERRORS.AR_IMAGE_REQUIRED;
  //     }
  //     if (!link) {
  //       throw ERRORS.LINK_REQUIRED;
  //     }
  
  //     const enImage = await uploadImage(enImagePreview);
  //     const arImage = await uploadImage(arImagePreview);

  //     const body = {
  //       link: link,
  //       start_timestamp: startDate.toISOString(),
  //       end_timestamp: endDate.toISOString(),
  //       image_en: enImage,
  //       image_ar: arImage,
  //     }
  //     const result = await post('/banner', body);
  //     onSuccess(result);
      
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate all fields
      await bannerSchema.validate({
        link,
        startDate,
        endDate,
        enImage: enImagePreview,
        arImage: arImagePreview,
      }, { abortEarly: false });

      const enImage = await uploadImage(enImagePreview!);
      const arImage = await uploadImage(arImagePreview!);

      const body = {
        link: link,
        start_timestamp: startDate!.toISOString(),
        end_timestamp: endDate!.toISOString(),
        image_en: enImage,
        image_ar: arImage,
      };

      const result = await post('/banner', body);
      
      toast.success('Banner created successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      onSuccess(result);
      
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);
        
        toast.error('Please fix the form errors', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        console.error('API Error:', error);
        toast.error('Failed to create banner. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleENRemoveImage = () => {
    setENImagePreview(null);
  };

  const handleARRemoveImage = () => {
    setARImagePreview(null);
  };

  return (
    <>
      <div className="p-24">
        <div className="d-flex flex-column gap-20">
          {/* Link Input */}
          <div>
            <label
              className="form-label fw-semibold text-neutral-900"
              htmlFor="title"
            >
              Banner Link <span className="text-danger">*</span>
            </label>
            <div className="position-relative">
              <input
                type="text"
                className={`form-control ps-5 border ${
                  errors.link ? 'border-danger' : 'border-neutral-200'
                } radius-8`}
                id="title"
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
              />
              <span className="position-absolute start-0 top-50 translate-middle-y ms-3">
                <LinkIcon className="icon" size={16} />
              </span>
            </div>
            {errors.link && (
              <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                <AlertCircle size={12} />
                <span>{errors.link}</span>
              </div>
            )}
          </div>

          {/* Date Pickers */}
          <div className='row'>
            <div className='col-md-6 mb-20'>
              <label
                htmlFor='startDate'
                className='form-label fw-semibold text-primary-light text-sm mb-8'
              >
                Start Date <span className="text-danger">*</span>
              </label>
              <div className='position-relative'>
                <DatePicker
                  id='startDate'
                  placeholder='Select Start Date'
                  onChange={(date) => setStartDate(date)}
                />
                <span className='position-absolute end-0 top-50 translate-middle-y me-12 line-height-1'>
                  <Calendar className='icon' size={18} />
                </span>
              </div>
              {errors.startDate && (
                <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                  <AlertCircle size={12} />
                  <span>{errors.startDate}</span>
                </div>
              )}
            </div>
            
            <div className='col-md-6 mb-20'>
              <label
                htmlFor='endDate'
                className='form-label fw-semibold text-primary-light text-sm mb-8'
              >
                End Date <span className="text-danger">*</span>
              </label>
              <div className='position-relative'>
                <DatePicker
                  id='endDate'
                  placeholder='Select End Date'
                  onChange={(date) => setEndDate(date)}
                />
                <span className='position-absolute end-0 top-50 translate-middle-y me-12 line-height-1'>
                  <Calendar className='icon' size={18} />
                </span>
              </div>
              {errors.endDate && (
                <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                  <AlertCircle size={12} />
                  <span>{errors.endDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="row">
            <div className="col-md-6">
              <label className="form-label fw-semibold text-neutral-900">
                English Banner <span className="text-danger">*</span>
                <span className="text-secondary-light text-sm ms-2">(Max 2MB)</span>
              </label>
              <div className="upload-image-wrapper">
                {enImagePreview ? (
                  <div className="uploaded-img position-relative h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50">
                    <button
                      type="button"
                      onClick={handleENRemoveImage}
                      className="uploaded-img__remove position-absolute top-0 end-0 z-1 text-2xxl line-height-1 me-8 mt-8 d-flex"
                      aria-label="Remove uploaded image"
                    >
                      <X className="text-danger-600" size={20} />
                    </button>
                    <img
                      className="w-100 h-100 object-fit-cover"
                      src={enImagePreview}
                      alt="English Banner Preview"
                    />
                  </div>
                ) : (
                  <label
                    className="upload-file h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50 bg-hover-neutral-200 d-flex align-items-center flex-column justify-content-center gap-1"
                    htmlFor="upload-file-en"
                  >
                    <Camera className="text-secondary-light" size={32} />
                    <span className="fw-semibold text-secondary-light">
                      Click to Upload
                    </span>
                    <span className="text-xs text-secondary-light">
                      PNG, JPG up to 2MB
                    </span>
                    <input
                      id="upload-file-en"
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleENFileChange}
                    />
                  </label>
                )}
              </div>
              {errors.enImage && (
                <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                  <AlertCircle size={12} />
                  <span>{errors.enImage}</span>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold text-neutral-900">
                Arabic Banner <span className="text-danger">*</span>
                <span className="text-secondary-light text-sm ms-2">(Max 2MB)</span>
              </label>
              <div className="upload-image-wrapper">
                {arImagePreview ? (
                  <div className="uploaded-img position-relative h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50">
                    <button
                      type="button"
                      onClick={handleARRemoveImage}
                      className="uploaded-img__remove position-absolute top-0 end-0 z-1 text-2xxl line-height-1 me-8 mt-8 d-flex"
                      aria-label="Remove uploaded image"
                    >
                      <X className="text-danger-600" size={20} />
                    </button>
                    <img
                      className="w-100 h-100 object-fit-cover"
                      src={arImagePreview}
                      alt="Arabic Banner Preview"
                    />
                  </div>
                ) : (
                  <label
                    className="upload-file h-160-px w-100 border input-form-light radius-8 overflow-hidden border-dashed bg-neutral-50 bg-hover-neutral-200 d-flex align-items-center flex-column justify-content-center gap-1"
                    htmlFor="upload-file-ar"
                  >
                    <Camera className="text-secondary-light" size={32} />
                    <span className="fw-semibold text-secondary-light">
                      Click to Upload
                    </span>
                    <span className="text-xs text-secondary-light">
                      PNG, JPG up to 2MB
                    </span>
                    <input
                      id="upload-file-ar"
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleARFileChange}
                    />
                  </label>
                )}
              </div>
              {errors.arImage && (
                <div className="d-flex align-items-center gap-1 text-danger small mt-1">
                  <AlertCircle size={12} />
                  <span>{errors.arImage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary-600 radius-8 w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spinner-icon" size={16} />
                Creating Banner...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Banner
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
interface Banner {
  id: number;
  link: string;
  start_timestamp: string;
  end_timestamp: string;
  image_en: string;
  image_ar: string;
}

interface BannerCardProps extends Banner {
  deleteBanner: (id: number) => void;
}

const BannerCard: React.FC<BannerCardProps> = ({ 
  id, link, start_timestamp, end_timestamp, image_ar, image_en, deleteBanner 
}) => {
  const handleDelete = () => {
    deleteBanner(id);
  };

  // Format timestamps to be human readable
  const formatDate = (timestamp:string) => {
    if (!timestamp) return "Not specified";
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formattedStartDate = formatDate(start_timestamp);
  const formattedEndDate = formatDate(end_timestamp);
  
  return (
    <div className="col-xxl-3 col-md-4 col-sm-6">
      <div className="card border radius-12 overflow-hidden shadow-sm h-100 position-relative">
        {/* Delete button */}
        <button 
          onClick={handleDelete} 
          className="btn btn-danger-600 position-absolute p-8 radius-circle d-flex align-items-center justify-content-center" 
          style={{ width: '32px', height: '32px', zIndex: 10, top: '8px', right: '8px' }}
          aria-label="Delete banner"
        >
          <Trash2 size={14} />
        </button>
        
        {/* Arabic Banner Image */}
        <div className="position-relative" style={{ height: '160px' }}>
          <img
            src={image_ar}
            alt="Arabic Banner"
            className="w-100 h-100 object-fit-cover"
          />
          <span className="position-absolute top-0 start-0 m-8 badge bg-primary-600 text-white">
            AR
          </span>
        </div>
        
        {/* Content Section */}
        <div className="card-body p-16">
          {/* Status Badge */}
          <div className="mb-12">
            {new Date() >= new Date(start_timestamp) && new Date() <= new Date(end_timestamp) ? (
              <span className="badge bg-success-100 text-success-600 d-inline-flex align-items-center gap-4 px-12 py-6 radius-4">
                <CheckCircle2 size={14} />
                Active
              </span>
            ) : new Date() > new Date(end_timestamp) ? (
              <span className="badge bg-neutral-100 text-neutral-600 d-inline-flex align-items-center gap-4 px-12 py-6 radius-4">
                <XCircle size={14} />
                Expired
              </span>
            ) : (
              <span className="badge bg-info-100 text-info-600 d-inline-flex align-items-center gap-4 px-12 py-6 radius-4">
                <Clock size={14} />
                Scheduled
              </span>
            )}
          </div>

          {/* Link */}
          <div className="d-flex align-items-start gap-8 mb-12">
            <LinkIcon size={14} className="text-secondary-light mt-4 flex-shrink-0" />
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-primary-600 hover-text-primary-800 text-decoration-none text-break"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {link}
            </a>
          </div>
          
          {/* Date Range */}
          <div className="d-flex flex-column gap-8">
            <div className="d-flex align-items-center gap-8 text-sm text-secondary-light">
              <Clock size={14} className="flex-shrink-0" />
              <div>
                <span className="fw-semibold text-neutral-900">Start:</span>
                <span className="ms-4">{formattedStartDate}</span>
              </div>
            </div>
            <div className="d-flex align-items-center gap-8 text-sm text-secondary-light">
              <Clock size={14} className="flex-shrink-0" />
              <div>
                <span className="fw-semibold text-neutral-900">End:</span>
                <span className="ms-4">{formattedEndDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* English Banner Image */}
        <div className="position-relative border-top" style={{ height: '160px' }}>
          <img
            src={image_en}
            alt="English Banner"
            className="w-100 h-100 object-fit-cover"
          />
          <span className="position-absolute top-0 start-0 m-8 badge bg-warning-600 text-white">
            EN
          </span>
        </div>
      </div>
    </div>
  );
};

//****************************************************************** * START OF THE MARKETING PAGE************************************************************************************

export default function MarketingPage() {
  const [banners, setBanners] = useState<Banner[]>([]);

  const [newBannerModel, setNewBannerModel] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // const handleDeleteBanner = (id: number) => {
  //   // Show confirmation dialog
  //   if (confirm("Are you sure you want to delete this banner?")) {
  //     // Call your API to delete the banner
  //     del(`/banner/${id}`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //     .then(()=> {
         
  //         // Update the local state to remove the deleted banner
  //         setBanners(banners.filter(banner => banner.id !== id));
  //         // Or trigger a refresh
  //         setRefreshTrigger(prev => prev + 1);
  //       }).catch(error => {
  //       console.error('Error:', error);
  //       alert("Error deleting banner");
  //     });
  //   }
  // };

  const handleDeleteBanner = async (id: number) => {
    try {
      const confirmed = await new Promise((resolve) => {
        toast.info(
          <div>
            <p>Are you sure you want to delete this banner?</p>
            <div className="d-flex gap-2 mt-2">
              <button 
                className="btn btn-sm btn-danger" 
                onClick={() => {
                  toast.dismiss();
                  resolve(true);
                }}
              >
                Yes, delete
              </button>
              <button 
                className="btn btn-sm btn-secondary" 
                onClick={() => {
                  toast.dismiss();
                  resolve(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            closeButton: false,
          }
        );
      });
  
      if (!confirmed) return;
  
      await del(`/banner/${id}`);
      
      setBanners(banners.filter(banner => banner.id !== id));
      
      toast.success('Banner deleted successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete banner. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };


  useEffect(() => {
    const fetchBanners = async () => {
      const banners: Banner[] = await get('/banner/all');

      console.log(banners,"dede")
      if (!banners) {
        return;
      }
      setBanners(banners);
      console.log(banners)
    }
    fetchBanners();
  }
  , [refreshTrigger]);

  const onSuccess = (banner: Banner) => {
    setBanners((state)=>{return [...state,banner]})
    setNewBannerModel(false)
  }


  return (
    <>
    <style>{`
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      .spinner-icon {
        animation: spin 1s linear infinite;
      }
    `}</style>
    <ToastContainer />
    <Modal 
      size="lg" 
      show={newBannerModel}  
      onHide={() => setNewBannerModel(false)}
    >
      <Modal.Header closeButton className="border-bottom bg-base">
        <h4 className="mb-0 fw-bold">Add New Banner</h4>
      </Modal.Header>
      <Modal.Body className="bg-base">
        <AddNewBanner onSuccess={onSuccess} />
      </Modal.Body>
    </Modal>
    <div className='card h-100 p-0 radius-12'>
      <div className='card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between'>
        <div className='d-flex align-items-center flex-wrap gap-3'>
          <div className="w-48-px h-48-px bg-primary-600 radius-8 d-flex align-items-center justify-content-center">
            <LinkIcon size={24} className="text-white" />
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Marketing Banners</h5>
            <span className="text-sm text-secondary-light">Manage your promotional banners</span>
          </div>
        </div>
        <button
          onClick={() => setNewBannerModel(true)}
          className='btn btn-primary-600 text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2'
        >
          <Plus size={18} />
          Add New Banner
        </button>
      </div>
      
      <div className='card-body p-24'>
        {banners.length === 0 ? (
          <div className="text-center py-5">
            <div className="w-80-px h-80-px bg-neutral-100 radius-circle d-flex align-items-center justify-content-center mx-auto mb-16">
              <LinkIcon size={40} className="text-secondary-light" />
            </div>
            <h6 className="mb-8 fw-semibold">No banners yet</h6>
            <p className="text-secondary-light mb-20">
              Get started by creating your first marketing banner to promote your services
            </p>
            <button
              onClick={() => setNewBannerModel(true)}
              className='btn btn-primary-600 px-20 py-11 radius-8 d-inline-flex align-items-center gap-2'
            >
              <Plus size={18} />
              Create Your First Banner
            </button>
          </div>
        ) : (
          <div className='row gy-4'>
            {banners.map((banner) => {
              return (
                <BannerCard 
                  key={banner.id} 
                  id={banner.id} 
                  image_ar={banner.image_ar} 
                  image_en={banner.image_en} 
                  link={banner.link} 
                  start_timestamp={banner.start_timestamp} 
                  end_timestamp={banner.end_timestamp}  
                  deleteBanner={handleDeleteBanner}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
    </>
  )
  
}
