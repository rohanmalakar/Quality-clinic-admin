"use client";

import { ERRORS } from "@/utils/errors";
import { post } from "@/utils/network";
import { useState } from "react";
import { Notification } from "@/utils/types";

interface NotificationFormData {
  title_ar: string | null;
  title_en: string | null;
  message_ar: string;
  message_en: string;
  scheduled_timestamp: string;
}

interface AddNotificationLayerProps {
  onSuccess: (notification: Notification) => void;
}

const AddNotificationLayer: React.FC<AddNotificationLayerProps> = ({ onSuccess }) => {
  // Helper function to get local datetime in format for datetime-local input
  const getLocalDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<NotificationFormData>({
    title_ar: null,
    title_en: null,
    message_ar: "",
    message_en: "",
    scheduled_timestamp: getLocalDateTimeString(),
  });

  const handleSubmit = async () => {
    try {
      if(!formData.message_ar) {
        throw ERRORS.NOTIFICATION_MESSAGE_AR_REQUIRED;
      }
      if(!formData.message_en) {
        throw ERRORS.NOTIFICATION_MESSAGE_EN_REQUIRED;
      }
      if(!formData.scheduled_timestamp) {
        throw ERRORS.NOTIFICATION_SCHEDULED_TIMESTAMP_REQUIRED;
      }
      if(!formData.title_ar) {
        throw ERRORS.NOTIFICATION_TITLE_AR_REQUIRED;
      }
      if(!formData.title_en) {
        throw ERRORS.NOTIFICATION_TITLE_EN_REQUIRED;
      }
      
      const payload = {
        ...formData,
        scheduled_timestamp: new Date(formData.scheduled_timestamp).toISOString()
      };
      
      const data: any = await post("/notification", payload);
      onSuccess(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.replace("-", "_")]: value,
    });
  };

  return (
    <div className="card">
      
        <div className="mb-20">
          <label
            htmlFor="title-en"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            Title (English)
          </label>
          <input
            type="text"
            className="form-control radius-8"
            value={formData.title_en || ""}
            onChange={handleChange}
            id="title-en"
            placeholder="Enter title in English"
          />
        </div>
        <div className="mb-20">
          <label
            htmlFor="title-ar"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            Title (Arabic)
          </label>
          <input
            type="text"
            className="form-control radius-8"
            value={formData.title_ar || ""}
            onChange={handleChange}
            id="title-ar"
            placeholder="Enter title in Arabic"
          />
        </div>
        <div className="mb-20">
          <label
            htmlFor="message-en"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            Message (English)
          </label>
          <input
            type="text"
            className="form-control radius-8"
            value={formData.message_en}
            onChange={handleChange}
            id="message-en"
            placeholder="Enter message in English"
          />
        </div>

        <div className="mb-20">
          <label
            htmlFor="message-ar"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            Message (Arabic)
          </label>
          <input
            type="text"
            className="form-control radius-8"
            value={formData.message_ar}
            onChange={handleChange}
            id="message-ar"
            placeholder="Enter message in Arabic"
          />
        </div>

        <div className="mb-20">
          <label
            htmlFor="scheduled-timestamp"
            className="form-label fw-semibold text-primary-light text-sm mb-8"
          >
            Schedule Time <span className="text-danger-600">*</span>
          </label>
          <input
            value={formData.scheduled_timestamp}
            onChange={handleChange}
            type="datetime-local"
            className="form-control radius-8"
            id="scheduled-timestamp"
          />
        </div>

        <div className="d-flex align-items-center justify-content-center gap-3">
          <button
            type="button"
            className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
          >
            Save
          </button>
        </div>
   
    </div>
  );
};

export default AddNotificationLayer;