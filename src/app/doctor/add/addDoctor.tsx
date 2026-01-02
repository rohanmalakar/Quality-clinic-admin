"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import BranchSelection from "./addBranch";
import TimeSlotCreator from "./time-range-selector";
import { Doctor, SelectedBranch, TimeRange } from "@/utils/types";
import { ERRORS } from "@/utils/errors";
import { get, post, put, uploadImage } from "@/utils/network";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
interface AddUserLayerProps {
  doctor?: Doctor; // Doctor data from API (or undefined)
  onSuccess: (doctor: Doctor) => void;
  oldSelectedBranches?: SelectedBranch[];
  oldSelectedTimeSlots?: TimeRange[];
}

interface OldData {
  doctor?: Doctor;
  selectedBranches?: SelectedBranch[];
  timeSlots?: TimeRange[];
}

function constructDayMap(arr: number[]): string {
  let result = "";
  for (let i = 1; i <= 7; i++) {
    result += arr.includes(i) ? "1" : "0";
  }
  return result;
}

function constructAvailableDays(binaryString: string | number): number[] {
  // Convert to string if it's a number
  const str =
    typeof binaryString === "number" ? binaryString.toString() : binaryString;

  if (!str || typeof str !== "string") {
    console.error("Invalid input:", str);
    return [];
  }

  return [...str]
    .map((bit, index) => (bit === "1" ? index + 1 : -1))
    .filter((index) => index !== -1);
}

const AddUserLayer: React.FC<AddUserLayerProps> = ({
  doctor,
  onSuccess,
  oldSelectedBranches,
  oldSelectedTimeSlots,
}) => {
  const [selectedBranches, setSelectedBranches] = useState<SelectedBranch[]>(
    []
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeRange[]>([]);
  const [oldData, setOldData] = useState<OldData>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Doctor>({
    id: undefined,
    name_en: "",
    name_ar: "",
    attended_patient: 0,
    session_fees: 0,
    total_experience: 0,
    about_en: "",
    about_ar: "",
    photo_url: "",
    languages: "",
    qualification: "",
  });

  // Prefill form when doctor data is provided
  useEffect(() => {
    if (doctor) {
      setFormData({
        id: doctor.id || undefined,
        name_en: doctor.name_en || "",
        name_ar: doctor.name_ar || "",
        attended_patient: doctor.attended_patient || 0,
        session_fees: doctor.session_fees || 0,
        total_experience: doctor.total_experience || 0,
        about_en: doctor.about_en || "",
        about_ar: doctor.about_ar || "",
        photo_url: doctor.photo_url || "",
        qualification: doctor.qualification || "",
        languages: doctor.languages || "",
      });

      setImagePreviewUrl(doctor.photo_url || "");
      fetchBranchesAndTimeSlots(doctor.id ?? 0);
    }
  }, [doctor]);

  const fetchBranchesAndTimeSlots = async (doctorID: number) => {
    try {
      const branches = await get(`/doctor/branches?doctor_id=${doctorID}`);
      const timeSlots = await get(`/doctor/all/time-slot?doctor_id=${doctorID}`);
      const selected_branches = branches.map((branch: any): SelectedBranch => {
        const availableDays = constructAvailableDays(branch.day_map);
        return {
          id: branch.branch_id,
          name_en: branch.name_en,
          availableDays: availableDays,
        };
      });
      setSelectedBranches(selected_branches);
      setSelectedTimeSlots(timeSlots);
      setOldData({
        doctor: doctor,
        selectedBranches: selected_branches,
        timeSlots: timeSlots,
      });
    } catch (e) {
      console.log(e);
      toast.error('Failed to fetch branches and time slots', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   
    if(!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedFormats.includes(file.type)) {
      toast.error('Please upload only JPG, JPEG, or PNG images', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      e.target.value = ''; // Reset input
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      e.target.value = ''; // Reset input
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const src = URL.createObjectURL(e.target.files[0]);
      setImagePreviewUrl(src);
      setFormData((prev) => ({ ...prev, photo_url: src }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    if (
      id == "attended_patient" ||
      id == "session_fees" ||
      id == "total_experience"
    ) {
      setFormData((prev) => ({ ...prev, [id]: parseInt(value) }));
      return;
    }
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (doctor) {
        await handleUpdate();
      } else {
        await handleCreate();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!doctor) {
      return;
    }
    try {
      const data: any = {};
      if (formData.about_ar && formData.about_en != doctor?.about_en) {
        data.about_ar = formData.about_ar;
      }
      if (formData.about_en && formData.about_en != doctor?.about_en) {
        data.about_en = formData.about_en;
      }
      if (
        formData.attended_patient &&
        formData.attended_patient != doctor?.attended_patient
      ) {
        data.attended_patient = formData.attended_patient;
      }
      if (
        formData.session_fees &&
        formData.session_fees != doctor?.session_fees
      ) {
        data.session_fees = formData.session_fees;
      }
      if (
        formData.total_experience &&
        formData.total_experience != doctor?.total_experience
      ) {
        data.total_experience = formData.total_experience;
      }
      if (formData.name_ar && formData.name_ar != doctor?.name_ar) {
        data.name_ar = formData.name_ar;
      }
      if (formData.name_en && formData.name_en != doctor?.name_en) {
        data.name_en = formData.name_en;
      }
      if (
        formData.qualification &&
        formData.qualification != doctor?.qualification
      ) {
        data.qualification = formData.qualification;
      }
      if (formData.languages && formData.languages != doctor?.languages) {
        data.languages = formData.languages;
      }
      if (formData.photo_url && formData.photo_url != doctor?.photo_url) {
        const imageURL = await uploadImage(formData.photo_url);
        data.photo_url = imageURL;
      }
      let newDoctor = doctor;
      if (Object.keys(data).length > 0) {
        newDoctor = await put(`/doctor/${doctor?.id}`, data);
      }

      if (
        JSON.stringify(oldData.selectedBranches) !==
        JSON.stringify(selectedBranches)
      ) {
        const branches = selectedBranches.map((branch) => {
          const day_map = constructDayMap(branch.availableDays);
          return {
            branch_id: branch.id,
            day_map: day_map,
          };
        });
        await put(`/doctor/branches/${doctor?.id}`, { branches });
      }
      if (
        JSON.stringify(oldData.timeSlots) !== JSON.stringify(selectedTimeSlots)
      ) {
        await put(`/doctor/time-slots/${doctor?.id}`, {
          time_slots: selectedTimeSlots,
        });
      }
      onSuccess(newDoctor);
      toast.success("Doctor updated successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (e: any) {
      console.error("Error updating doctor:", e);
      const errorMessage = e?.message || "Failed to update doctor. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleCreate = async () => {
    try {
      // Clear previous errors
      setErrors({});
      
      // Validate all fields
      const newErrors: Record<string, string> = {};
      
      if (!formData.name_en) {
        newErrors.name_en = "English name is required";
      }
      if (!formData.name_ar) {
        newErrors.name_ar = "Arabic name is required";
      }
      if (!formData.about_ar) {
        newErrors.about_ar = "Arabic about description is required";
      }
      if (!formData.about_en) {
        newErrors.about_en = "English about description is required";
      }
      if (!formData.attended_patient || formData.attended_patient <= 0) {
        newErrors.attended_patient = "Attended patients must be greater than 0";
      }
      if (!formData.session_fees || formData.session_fees <= 0) {
        newErrors.session_fees = "Session fees must be greater than 0";
      }
      if (!formData.total_experience || formData.total_experience <= 0) {
        newErrors.total_experience = "Total experience must be greater than 0";
      }
      if (!formData.qualification) {
        newErrors.qualification = "Qualification is required";
      }
      if (!formData.languages) {
        newErrors.languages = "Languages are required";
      }
      if (!formData.photo_url) {
        newErrors.photo_url = "Profile image is required";
      }
      if (selectedBranches.length === 0) {
        newErrors.branches = "At least one branch must be selected";
        toast.error("Please select at least one branch", {
          position: "top-right",
          autoClose: 5000,
        });
      }
      if (selectedTimeSlots.length === 0) {
        newErrors.timeSlots = "At least one time slot must be added";
        toast.error("Please add at least one time slot", {
          position: "top-right",
          autoClose: 5000,
        });
      }
      
      // Check if there are any errors
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please fill in all required fields correctly", {
          position: "top-right",
          autoClose: 5000,
        });
        return;
      }
      
      const imageURL = await uploadImage(formData.photo_url);
      const data = {
        ...formData,
        photo_url: imageURL,
      };
      const response = await post("/doctor", data);
      const doctorID = response.id;
      await post("/doctor/time-slots", {
        doctor_id: doctorID,
        time_slots: selectedTimeSlots,
      });
      const branches = selectedBranches.map((branch) => {
        const day_map = constructDayMap(branch.availableDays);
        return {
          branch_id: branch.id,
          day_map: day_map,
        };
      });
      for (const branch of branches) {
        await post("/doctor/branches", {
          doctor_id: doctorID,
          branches: branches,
        });
      }
      toast.success("Doctor created successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onSuccess(response);
    } catch (e: any) {
      console.error("Error creating doctor:", e);
      const errorMessage = e?.message || "Failed to create doctor. Please try again.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div>
      <h6 className="text-md text-primary-light mb-16">
        Profile Image (Max Size 5Mb - JPG, JPEG, PNG only) <span className="text-danger-600">*</span>
      </h6>
      <ToastContainer />
      {/* Upload Image */}
      <div className="mb-24 mt-16">
        <div className="avatar-upload">
          <div className="avatar-edit position-absolute bottom-0 end-0 me-24 mt-16 z-1 cursor-pointer">
            <input
              type="file"
              id="imageUpload"
              accept=".png, .jpg, .jpeg"
              hidden
              onChange={handleImageChange}
            />
            <label
              htmlFor="imageUpload"
              className="w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle"
            >
              <Icon icon="solar:camera-outline" className="icon"></Icon>
            </label>
          </div>
          <div className="avatar-preview">
            <div
              id="imagePreview"
              style={{
                backgroundImage: imagePreviewUrl
                  ? `url(${imagePreviewUrl})`
                  : "",
              }}
            ></div>
          </div>
        </div>
        {errors.photo_url && (
          <div className="text-danger small mt-2">{errors.photo_url}</div>
        )}
      </div>

      {/* Form */}

      <div>
        <div className="row">
          <div className="col-12 col-md-6 mb-20">
            <label
              htmlFor="name_en"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Full Name (English) <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              className={`form-control radius-8 ${errors.name_en ? 'is-invalid' : ''}`}
              id="name_en"
              required
              placeholder="Enter Full Name"
              value={formData.name_en}
              onChange={handleChange}
            />
            {errors.name_en && (
              <div className="invalid-feedback d-block">{errors.name_en}</div>
            )}
          </div>

          <div className="col-12 col-md-6 mb-20">
            <label
              htmlFor="name_ar"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Full Name (Arabic) <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              required
              className={`form-control radius-8 ${errors.name_ar ? 'is-invalid' : ''}`}
              id="name_ar"
              placeholder="Enter Full Name"
              value={formData.name_ar}
              onChange={handleChange}
            />
            {errors.name_ar && (
              <div className="invalid-feedback d-block">{errors.name_ar}</div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-12 col-md-6 mb-20">
            <label
              htmlFor="attended_patient"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Attended Patients <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              className={`form-control radius-8 ${errors.attended_patient ? 'is-invalid' : ''}`}
              id="attended_patient"
              required
              placeholder="Enter number of attended patients"
              value={formData.attended_patient}
              onChange={handleChange}
              min="0"
            />
            {errors.attended_patient && (
              <div className="invalid-feedback d-block">{errors.attended_patient}</div>
            )}
          </div>

          <div className="col-12 col-md-6 mb-20">
            <label
              htmlFor="session_fees"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Session Fees <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              required
              className={`form-control radius-8 ${errors.session_fees ? 'is-invalid' : ''}`}
              id="session_fees"
              placeholder="Enter session fees"
              value={formData.session_fees}
              onChange={handleChange}
              min="0"
            />
            {errors.session_fees && (
              <div className="invalid-feedback d-block">{errors.session_fees}</div>
            )}
          </div>
        </div>
        <div className="row">
          <div className="col-12 col-md-6 mb-20">
            <label
              htmlFor="total_experience"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Total Experience (Years) <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              required
              className={`form-control radius-8 ${errors.total_experience ? 'is-invalid' : ''}`}
              id="total_experience"
              placeholder="Enter years of experience"
              value={formData.total_experience}
              onChange={handleChange}
              min="0"
            />
            {errors.total_experience && (
              <div className="invalid-feedback d-block">{errors.total_experience}</div>
            )}
          </div>

          <div className="col-12 col-md-6 mb-20">
            <label
              htmlFor="qualification"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Qualification <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              className={`form-control radius-8 ${errors.qualification ? 'is-invalid' : ''}`}
              id="qualification"
              required
              placeholder="Enter qualification"
              value={formData.qualification}
              onChange={handleChange}
            />
            {errors.qualification && (
              <div className="invalid-feedback d-block">{errors.qualification}</div>
            )}
          </div>
        </div>
        <div className="mb-20">
          <label
            htmlFor="languages"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            Languages <span className="text-danger-600">*</span>
          </label>
          <input
            type="text"
            className={`form-control radius-8 ${errors.languages ? 'is-invalid' : ''}`}
            id="languages"
            required
            placeholder="Enter languages (e.g., English, Arabic)"
            value={formData.languages}
            onChange={handleChange}
          />
          {errors.languages && (
            <div className="invalid-feedback d-block">{errors.languages}</div>
          )}
        </div>

        <div className="mb-20">
          <label
            htmlFor="about_en"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            About (English) <span className="text-danger-600">*</span>
          </label>
          <textarea
            className={`form-control radius-8 ${errors.about_en ? 'is-invalid' : ''}`}
            id="about_en"
            required
            placeholder="Write description..."
            value={formData.about_en}
            onChange={handleChange}
            rows={4}
          />
          {errors.about_en && (
            <div className="invalid-feedback d-block">{errors.about_en}</div>
          )}
        </div>

        <div className="mb-20">
          <label
            htmlFor="about_ar"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            About (Arabic) <span className="text-danger-600">*</span>
          </label>
          <textarea
            className={`form-control radius-8 ${errors.about_ar ? 'is-invalid' : ''}`}
            id="about_ar"
            required
            placeholder="Write description..."
            value={formData.about_ar}
            onChange={handleChange}
            rows={4}
          />
          {errors.about_ar && (
            <div className="invalid-feedback d-block">{errors.about_ar}</div>
          )}
        </div>
        {/* Branch Selection */}
        <BranchSelection
          selectedBranches={selectedBranches}
          setSelectedBranches={(branches) => setSelectedBranches(branches)}
        />

        {/* Time Slot */}
        <TimeSlotCreator
          title="Time Slot"
          selectedTimeSlots={selectedTimeSlots}
          setSelectedTimeSlots={setSelectedTimeSlots}
        />
        <div className="col-12">
          <button
            onClick={handleSubmit}
            className="btn btn-primary w-100 w-md-auto px-5"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {doctor ? "Updating..." : "Creating..."}
              </>
            ) : (
              doctor ? "Update Doctor" : "Add Doctor"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserLayer;
