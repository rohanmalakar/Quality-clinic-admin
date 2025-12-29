"use client";
import React, { useEffect, useState } from "react";
import {
  Plus,
  UserPlus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Stethoscope,
  Languages,
  GraduationCap,
  Shield,
  ShieldOff,
  Briefcase,
  DollarSign,
  Star,
  Users
} from "lucide-react";
import Modal from "react-bootstrap/Modal";
import AddUserLayer from "./add/addDoctor";
import DoctorDetailsModal from "./DoctorDetailsModal";
import { del, get, put } from "@/utils/network";
import { Doctor, SelectedBranch } from "@/utils/types";
import { ToastContainer } from "react-toastify";

const DoctorDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDoctorModel, setShowCreateDoctorModel] = useState(false);
  const [showEditUserModel, setShowEditUserModel] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [refresh, setRefresh] = useState<boolean>(true);
  const [doctorsBranches, setDoctorsBranches] = useState<any>(null);
  const [doctorsTimeSlots, setDoctorsTimeSlots] = useState<any>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await get("/doctor"); // Replace with your actual API endpoint
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [refresh]);

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
  const handleEditDoctor = async (doctorId: Doctor) => {

    try {
      const doctorToEdit = doctors.find((doctor) => doctor.id === doctorId);

      if (!doctorToEdit) {
        console.error("Doctor not found in state!");
        return;
      }

      const branch = await get(`/doctor/branches/?doctor_id=${doctorId}`);
      const timeSlots = await get(`/doctor/all/time-slot/?doctor_id=${doctorId}`);

      setSelectedDoctor(doctorToEdit);

      const selectedBranches = branch.map((branch: any): SelectedBranch => {
        const availableDays = constructAvailableDays(branch.day_map);
        return {
          id: branch.branch_id,
          name_en: branch.name_en,
          availableDays: availableDays,
        };
      });

      setDoctorsBranches(selectedBranches);
      setDoctorsTimeSlots(timeSlots);
      setShowEditUserModel(true);

    } catch (error) {
      console.error("Error fetching doctor details:", error);
      setError("Failed to fetch doctor details.");
    }
  };

  const handDeleteDoctor = async (doctorId: Doctor) => {
    try {
      await del(`/doctor/${doctorId}`);
      setDoctors((state) => state.filter((doctor) => doctor.id !== doctorId));
      setShowDetailsModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCardClick = (doctor: any) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  useEffect(() => {
    console.log("Doctors:", selectedDoctor); // Debugging log
  }, [selectedDoctor]);
  [];

  const onSuccessDoctorCreate = (doctor: Doctor) => {
    setDoctors((state) => {
      return [...state, doctor];
    });
    setShowCreateDoctorModel(false);
  };

  const onSuccessDoctorEdit = (doctor: Doctor) => {
    setDoctors((state) => {
      return state.map((d) => (d.id === doctor.id ? doctor : d));
    });
    setShowEditUserModel(false);
  };
  const changeActiveStatus = async (doctor: any) => {
    try {
      const updatedDoctor = { ...doctor, is_active: !doctor.is_active };
      console.log(updatedDoctor);
      const data = await put(`/doctor/${doctor?.id}`, updatedDoctor);

      // Update the doctors state to reflect the change
      setDoctors((state) => {
        return state.map((d) => (d.id === doctor.id ? updatedDoctor : d));
      });

      // Trigger refresh
      setRefresh((prev) => !prev);
    } catch (err: any) {
      console.error("Error updating doctor status:", err);
      setError(err.message);
    }
  };
  return (
    <>
      {/* Create Doctor Modal */}
      <ToastContainer />
      <Modal
        show={showCreateDoctorModel}
        size="lg"
        onHide={() => setShowCreateDoctorModel(false)}
      >
        <Modal.Header closeButton className="border-bottom bg-base">
          <Modal.Title className="d-flex align-items-center gap-2">
            <UserPlus size={20} />
            Register New Doctor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-base">
          <AddUserLayer onSuccess={onSuccessDoctorCreate} />
        </Modal.Body>
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        show={showEditUserModel}
        size="lg"
        onHide={() => setShowEditUserModel(false)}
      >
        <Modal.Header closeButton className="border-bottom bg-base">
          <Modal.Title className="d-flex align-items-center gap-2">
            <Edit2 size={20} />
            Edit Doctor
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-base">
          <AddUserLayer
            onSuccess={onSuccessDoctorEdit}
            doctor={selectedDoctor}
            oldSelectedBranches={doctorsBranches}
            oldSelectedTimeSlots={doctorsTimeSlots}
          />
        </Modal.Body>
      </Modal>

      {/* Doctor Details Modal */}
      <DoctorDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        doctor={selectedDoctor}
        onEdit={() => {
          setShowDetailsModal(false);
          handleEditDoctor(selectedDoctor?.id);
        }}
        onDelete={() => {
          if (window.confirm('Are you sure you want to delete this doctor?')) {
            handDeleteDoctor(selectedDoctor?.id);
          }
        }}
      />

      <div className="card h-100 p-0 radius-12">
        <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="w-48-px h-48-px bg-primary-600 radius-8 d-flex align-items-center justify-content-center">
              <Stethoscope size={24} className="text-white" />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Doctors Management</h5>
              <span className="text-sm text-secondary-light">Manage your medical professionals</span>
            </div>
          </div>
          <button
            onClick={() => setShowCreateDoctorModel(true)}
            className="btn btn-primary-600 text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
            <UserPlus size={18} />
            Add New Doctor
          </button>
        </div>
        <div className="card-body p-24">
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-secondary-light">Loading doctors...</p>
            </div>
          )}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <Shield size={20} className="me-2" />
              {error}
            </div>
          )}
          {!loading && !error && doctors.length === 0 ? (
            <div className="text-center py-5">
              <div className="w-80-px h-80-px bg-neutral-100 radius-circle d-flex align-items-center justify-content-center mx-auto mb-16">
                <Stethoscope size={40} className="text-secondary-light" />
              </div>
              <h6 className="mb-8 fw-semibold">No doctors yet</h6>
              <p className="text-secondary-light mb-20">
                Get started by adding your first medical professional to the system
              </p>
              <button
                onClick={() => setShowCreateDoctorModel(true)}
                className="btn btn-primary-600 px-20 py-11 radius-8 d-inline-flex align-items-center gap-2"
              >
                <UserPlus size={18} />
                Add Your First Doctor
              </button>
            </div>
          ) : (
            <div className="row">
              {doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onClick={() => handleCardClick(doctor)}
                  onStatusChange={() => changeActiveStatus(doctor)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const DoctorCard = ({
  doctor,
  onClick,
  onStatusChange,
}: {
  doctor: any;
  onClick: () => void;
  onStatusChange: () => void;
}) => {
  return (
    <div className="col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6 p-2">
      <div
        className="card border radius-12 shadow-sm h-100 position-relative d-flex flex-column"
        style={{ cursor: "pointer" }}
        onClick={onClick}
      >
        {/* Doctor Image */}
        <div
          className="position-relative"
          style={{
            height: "400px",
            overflow: "hidden",
          }}
        >
          <img
            src={doctor.photo_url || "assets/images/user-grid/user-grid-img1.png"}
            alt={doctor.name_en}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Status Badge */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange();
            }}
            className={`position-absolute top-0 end-0 m-8 btn btn-sm radius-8 d-flex align-items-center gap-1 ${
              doctor.is_active == 1
                ? "btn-success-600 text-white"
                : "btn-danger-600 text-white"
            }`}
            style={{
              fontSize: "11px",
              padding: "4px 8px",
            }}
          >
            {doctor.is_active == 1 ? "Block" : "Unblock"}
          </button>
        </div>

        {/* Doctor Info */}
        <div
          className="card-body p-16 text-center d-flex flex-column"
          style={{ flexGrow: 1 }}
        >
          {/* Name */}
          <h6
            className="fw-bold text-neutral-900 mb-8"
            style={{
              minHeight: "24px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {doctor.name_en}
          </h6>

          {/* Meta Info */}
          <div
            className="d-flex flex-column gap-8"
            style={{ minHeight: "44px" }}
          >
            {/* Languages */}
            <div
              className="d-flex align-items-center justify-content-center gap-6 text-sm text-secondary-light"
              style={{ height: "20px" }}
            >
              {doctor.languages && (
                <>
                  <Languages size={14} />
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {doctor.languages}
                  </span>
                </>
              )}
            </div>

            {/* Qualification */}
            <div
              className="d-flex align-items-center justify-content-center gap-6 text-sm text-secondary-light"
              style={{ height: "20px" }}
            >
              {doctor.qualification && (
                <>
                  <GraduationCap size={14} />
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {doctor.qualification}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default DoctorDashboard;
