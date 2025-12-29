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
  console.log("oldSelectedBranches in adddoctor", oldSelectedBranches);
  console.log("oldSelectedTimeSlots in adddoctor", oldSelectedTimeSlots);
  const [selectedBranches, setSelectedBranches] = useState<SelectedBranch[]>(
    []
  );
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeRange[]>([]);
  const [oldData, setOldData] = useState<OldData>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      console.log("doctor in adddoctor", doctor);
      fetchBranchesAndTimeSlots(doctor.id ?? 0);
      console.log(
        "selectedBranches in fetchbranchsand useeffect",
        selectedBranches
      );
      console.log(
        "selectedTimeSlots in fetchbranchsand useeffect",
        selectedTimeSlots
      );
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

  // const handleSubmit = async () => {
  //   if (doctor) {
  //     handleUpdate();
  //   } else {
  //     handleCreate();
  //   }
  // };


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
    } catch (e) {
      console.log(e);
      toast.error("failed to update doctor", {
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
      if (!formData.about_ar) {
        throw ERRORS.DOCTOR_ABOUT_AR_REQUIRED;
      }
      if (!formData.about_en) {
        throw ERRORS.DOCTOR_ABOUT_EN_REQUIRED;
      }
      if (formData.attended_patient <= 0) {
        throw ERRORS.DOCTOR_ATTENDED_PATIENT_REQUIRED;
      }
      if (!formData.session_fees) {
        throw ERRORS.DOCTOR_SESSION_FEES_REQUIRED;
      }
      if (!formData.total_experience) {
        throw ERRORS.DOCTOR_TOTAL_EXPERIENCE_REQUIRED;
      }
      if (!formData.name_ar) {
        throw ERRORS.DOCTOR_NAME_AR_REQUIRED;
      }
      if (!formData.name_en) {
        throw ERRORS.DOCTOR_NAME_EN_REQUIRED;
      }
      if (!formData.qualification) {
        throw ERRORS.DOCTOR_QUALIFICATION_REQUIRED;
      }
      if (!formData.languages) {
        throw ERRORS.DOCTOR_LANGUAGES_REQUIRED;
      }
      if (!formData.photo_url) {
        throw ERRORS.DOCTOR_PHOTO_URL_REQUIRED;
      }
      if (selectedBranches.length === 0) {
        throw ERRORS.DOCTOR_BRANCH_REQUIRED;
      }
      if (selectedTimeSlots.length === 0) {
        throw ERRORS.DOCTOR_TIME_SLOT_REQUIRED;
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
    } catch (e) {
      console.log(e);
      toast.error("failed to create doctor", {
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
        Profile Image (Max Size 2Mb)
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
      </div>

      {/* Form */}

      <div>
        <div className="row">
          <div className="col mb-20">
            <label
              htmlFor="name_en"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Full Name (English)
            </label>
            <input
              type="text"
              className="form-control radius-8"
              id="name_en"
              placeholder="Enter Full Name"
              value={formData.name_en}
              onChange={handleChange}
            />
          </div>

          <div className="col mb-20">
            <label
              htmlFor="name_ar"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Full Name (Arabic)
            </label>
            <input
              type="text"
              className="form-control radius-8"
              id="name_ar"
              placeholder="Enter Full Name"
              value={formData.name_ar}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col mb-20">
            <label
              htmlFor="attended_patient"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Attended Patients <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              className="form-control radius-8"
              id="attended_patient"
              placeholder="Enter number of attended patients"
              value={formData.attended_patient}
              onChange={handleChange}
            />
          </div>

          <div className="col mb-20">
            <label
              htmlFor="session_fees"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Session Fees <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              className="form-control radius-8"
              id="session_fees"
              placeholder="Enter session fees"
              value={formData.session_fees}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="row">
          <div className="col mb-20">
            <label
              htmlFor="total_experience"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              Total Experience <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              className="form-control radius-8"
              id="total_experience"
              placeholder="Enter years of experience"
              value={formData.total_experience}
              onChange={handleChange}
            />
          </div>

          <div className="col mb-20">
            <label
              htmlFor="qualification"
              className="form-label fw-semibold text-primary-light text-sm mb-8"
            >
              qualification
            </label>
            <input
              type="text"
              className="form-control radius-8"
              id="qualification"
              placeholder="Enter qualification"
              value={formData.qualification}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="mb-20">
          <label
            htmlFor="languages"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            languages
          </label>
          <input
            type="text"
            className="form-control radius-8"
            id="languages"
            placeholder="Enter languages"
            value={formData.languages}
            onChange={handleChange}
          />
        </div>

        <div className="mb-20">
          <label
            htmlFor="about_en"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            About (English)
          </label>
          <textarea
            className="form-control radius-8"
            id="about_en"
            placeholder="Write description..."
            value={formData.about_en}
            onChange={handleChange}
          />
        </div>

        <div className="mb-20">
          <label
            htmlFor="about_ar"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            About (Arabic)
          </label>
          <textarea
            className="form-control radius-8"
            id="about_ar"
            placeholder="Write description..."
            value={formData.about_ar}
            onChange={handleChange}
          />
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
          {/* <button onClick={handleSubmit} className="btn btn-primary">
            {doctor ? "Update Doctor" : "Add Doctor"}
          </button> */}
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
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
