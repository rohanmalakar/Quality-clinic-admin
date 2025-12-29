import React from "react";
import Modal from "react-bootstrap/Modal";
import {
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Stethoscope,
  Languages,
  GraduationCap,
  Briefcase,
  DollarSign,
  Star,
  Users,
} from "lucide-react";

interface DoctorDetailsModalProps {
  show: boolean;
  onHide: () => void;
  doctor: any;
  onEdit: () => void;
  onDelete: () => void;
}

const DoctorDetailsModal: React.FC<DoctorDetailsModalProps> = ({
  show,
  onHide,
  doctor,
  onEdit,
  onDelete,
}) => {
  if (!doctor) return null;

  return (
    <Modal show={show} size="lg" onHide={onHide}>
      <Modal.Header closeButton className="border-bottom bg-base">
        <Modal.Title className="d-flex align-items-center gap-2">
          <Stethoscope size={20} />
          Doctor Details
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-base p-4">
        <div className="doctor-details">
          {/* Profile Section */}
          <div className="text-center mb-4 pb-4 border-bottom">
            <div className="position-relative d-inline-block mb-3">
              <img
                src={doctor.photo_url || "assets/images/user-grid/user-grid-img1.png"}
                alt={doctor.name_en}
                className="rounded-circle border border-2"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                }}
              />
              {doctor.is_active == 1 ? (
              <span
                className="position-absolute bottom-0 end-0 bg-success-600 rounded-circle border border-2 border-white d-flex align-items-center justify-content-center"
                style={{
                  width: "32px",
                  height: "32px",
                  transform: "translate(-8px, -8px)",
                }}
              >
                <UserCheck size={16} className="text-white" />
              </span>
            ) : (
              <span
                className="position-absolute bottom-0 end-0 bg-danger-600 rounded-circle border border-2 border-white d-flex align-items-center justify-content-center"
                style={{
                  width: "32px",
                  height: "32px",
                  transform: "translate(-8px, -8px)",
                }}
              >
                <UserX size={16} className="text-white" />
              </span>
            )}

            </div>
            <h4 className="mb-2 fw-bold text-neutral-900">{doctor.name_en}</h4>
            {doctor.qualification && (
              <div className="d-flex align-items-center justify-content-center gap-2 text-neutral-600 mb-2">
                <GraduationCap size={16} />
                <span className="text-sm">{doctor.qualification}</span>
              </div>
            )}
            {doctor.languages && (
              <div className="d-flex align-items-center justify-content-center gap-2 text-secondary-light">
                <Languages size={14} />
                <span className="text-sm">{doctor.languages}</span>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="row g-3 mb-4">
            {doctor.total_experience && (
              <div className="col-sm-6 col-12">
                <div className="card border radius-8 p-3 h-100 bg-base">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-48-px h-48-px bg-primary-50 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                      <Briefcase size={20} className="text-primary-600" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-sm text-secondary-light mb-1">Experience</div>
                      <div className="fw-bold fs-6">{doctor.total_experience} Years</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {doctor.session_fees && (
              <div className="col-sm-6 col-12">
                <div className="card border radius-8 p-3 h-100 bg-base">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-48-px h-48-px bg-success-50 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                      <DollarSign size={20} className="text-success-600" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-sm text-secondary-light mb-1">Session Fee</div>
                      <div className="fw-bold fs-6">{doctor.session_fees} SAR</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {doctor.rating && (
              <div className="col-sm-6 col-12">
                <div className="card border radius-8 p-3 h-100 bg-base">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-48-px h-48-px bg-warning-50 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                      <Star size={20} className="text-warning-600" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-sm text-secondary-light mb-1">Rating</div>
                      <div className="fw-bold fs-6">{doctor.rating} / 5.0</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {doctor.attended_patient && (
              <div className="col-sm-6 col-12">
                <div className="card border radius-8 p-3 h-100 bg-base">
                  <div className="d-flex align-items-center gap-3">
                    <div className="w-48-px h-48-px bg-info-50 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0">
                      <Users size={20} className="text-info-600" />
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-sm text-secondary-light mb-1">Patients Served</div>
                      <div className="fw-bold fs-6">{doctor.attended_patient}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* About Section */}
          {doctor.about_en && (
            <div className="card border radius-8 p-4 mb-4 bg-base">
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-neutral-900">
                <Stethoscope size={18} className="text-primary-600" />
                About the Doctor
              </h6>
              <div
                className="text-secondary-light"
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.8",
                  fontSize: "14px",
                  padding: "8px",
                }}
              >
                {doctor.about_en.replace(/^"|"$/g, "")}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-3 px-3 px-sm-5">
            <button
              onClick={onEdit}
              className="btn btn-primary-600 text-white w-100 d-flex align-items-center justify-content-center gap-2 py-3 radius-8"
            >
              <Edit2 size={18} />
              Edit Doctor
            </button>

            <button
              onClick={onDelete}
              className="btn btn-danger-600 text-white w-100 d-flex align-items-center justify-content-center gap-2 py-3 radius-8"
            >
              <Trash2 size={18} />
              Delete Doctor
            </button>
          </div>

        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DoctorDetailsModal;
