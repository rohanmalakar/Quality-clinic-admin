'use client';
import React from 'react';
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import AddUserLayer from './add/page';

const DoctorDashboard = () => {
  const [showCreateDoctorModel, setShowCreateDoctorModel ] = useState(false);
  const [showEditUserModel, setShowEditUserModel ] = useState(false);

  return (
    <>
    <Modal show={showCreateDoctorModel} fullscreen onHide={() => setShowCreateDoctorModel(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Register New Doctor </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AddUserLayer />
      </Modal.Body>
    </Modal>

    <Modal show={showEditUserModel} fullscreen onHide={() => setShowEditUserModel(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Doctor </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AddUserLayer />
      </Modal.Body>
    </Modal>
    <div className='card h-100 p-0 radius-12'>
      <div className='card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between'>
        <div className='d-flex align-items-center flex-wrap gap-3'>
          <span className='text-md fw-medium text-secondary-light mb-0'>
            Search Doctor
          </span>
          <form className='navbar-search'>
            <input
              type='text'
              className='bg-base h-40-px w-auto'
              name='search'
              placeholder='Search'
            />
            <Icon icon='ion:search-outline' className='icon' />
          </form>
        </div>
        <button
          onClick={() => setShowCreateDoctorModel(true)}
          className='btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2'
        >
          <Icon
            icon='ic:baseline-plus'
            className='icon text-xl line-height-1'
          />
          Add New User
        </button>
      </div>
      <div className='card-body p-24'>
        <div className='row'>
          <DoctorCard />
        </div>

      </div>
    </div>
    </>
  );
}

const DoctorCard = () => {  
 return (
  <div className='col-xxl-3 col-md-6 user-grid-card'>
    <div className='position-relative border radius-16 overflow-hidden'>
      <div className='ps-16 pb-16 pe-16 text-center mt-10'>
        <img
          src='assets/images/user-grid/user-grid-img1.png'
          alt=''
          className='border br-white border-width-2-px w-100-px h-100-px rounded-circle object-fit-cover'
        />
        <h6 className='text-lg mb-0 mt-4'>Jacob Jones</h6>
        <span className='text-secondary-light mb-16'>
          ifrandom@gmail.com
        </span>
        <div className='center-border position-relative bg-danger-gradient-light radius-8 p-12 d-flex align-items-center gap-4'>
          <div className='text-center w-50'>
            <h6 className='text-md mb-0'>Design</h6>
            <span className='text-secondary-light text-sm mb-0'>
              Department
            </span>
          </div>
          <div className='text-center w-50'>
            <h6 className='text-md mb-0'>UI UX Designer</h6>
            <span className='text-secondary-light text-sm mb-0'>
              Designation
            </span>
          </div>
        </div>
        <Link
          href='/view-profile'
          className='bg-primary-50 text-primary-600 bg-hover-primary-600 hover-text-white p-10 text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center justify-content-center mt-16 fw-medium gap-2 w-100'
        >
          Edit Profile
        </Link>
      </div>
    </div>
  </div>
 )
}
export default DoctorDashboard;