"use client";

import { post } from '@/utils/network';
import { Icon } from '@iconify/react/dist/iconify.js';
import Link from 'next/link';
import React from 'react';



const AdminPage: React.FC = () => {
    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const onSubmit = async () => {
        const { fullName, email, phoneNumber, password, confirmPassword } = formData;

        if (!fullName.trim()) {
            alert("Full Name is required.");
            return;
        }

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("A valid Email is required.");
            return;
        }

        if (!phoneNumber.trim() || !/^\d/.test(phoneNumber)) {
            alert("A valid 10-digit Phone Number is required.");
            return;
        }

        if (!password.trim() || password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        try {
            await post('/user/admin_register', {
                full_name: fullName,
                email_address: email,
                phone_number: phoneNumber,
                password: password,
            })
            alert("Account created successfully!");

        } catch (error) {
            alert("An error occurred while creating the account.");
            return;
        }
    }
    return (
        <div className='py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div>
            <h4 className='mb-12'>Create A New Admin Account</h4>
          </div>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='f7:person' />
              </span>
              <input
                value={formData.fullName}
                onChange={handleInputChange}
                name='fullName'
                type='text'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Full Name'
              />
            </div>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                value={formData.email}
                onChange={handleInputChange}
                name='email'
                type='email'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Email'
              />
            </div>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:email' />
              </span>
              <input
                type='number'
                value={formData.phoneNumber}
                onChange={handleInputChange}
                name='phoneNumber'
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Phone number'
              />
            </div>
            <div className='mb-20'>
              <div className='position-relative '>
                <div className='icon-field'>
                  <span className='icon top-50 translate-middle-y'>
                    <Icon icon='solar:lock-password-outline' />
                  </span>
                  <input
                    type='password'
                    value={formData.password}
                    onChange={handleInputChange}
                    name='password'
                    className='form-control h-56-px bg-neutral-50 radius-12'
                    id='your-password'
                    placeholder='Password'
                  />
                </div>
                <span
                  className='toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light'
                  data-toggle='#your-password'
                />
              </div>
            </div>
            <div className='mb-20'>
              <div className='position-relative '>
                <div className='icon-field'>
                  <span className='icon top-50 translate-middle-y'>
                    <Icon icon='solar:lock-password-outline' />
                  </span>
                  <input
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    name='confirmPassword'
                    type='password'
                    className='form-control h-56-px bg-neutral-50 radius-12'
                    id='your-password'
                    placeholder='Confirm Password'
                  />
                </div>
                <span
                  className='toggle-password ri-eye-line cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light'
                  data-toggle='#your-password'
                />
              </div>
            </div>
            <button
            onClick={onSubmit}
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
            >
              Create Admin Account
            </button>
        </div>
        </div>
    );
};

export default AdminPage;