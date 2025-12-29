export interface Category {
    id?: number;
    type: string;
    name_en: string;
    name_ar: string;
    image_en: string;
    image_ar: string;
}

export interface TimeRange {
    start_time: string;
    end_time: string;
  }

export interface Notification {
    
    message_ar: string;
    message_en: string;
    scheduled_timestamp: string;
}
  

export interface SelectedBranch {
  id: number;
  name_en: string;
  availableDays: number[];
}

export interface Doctor {
  id?: number;
  name_en: string;
  name_ar: string;
  attended_patient: number;
  session_fees: number;
  total_experience: number;
  languages: string;
  about_en: string;
  photo_url: string;
  about_ar: string;
  qualification: string;
}