'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoyaltyList, fetchRedemptionHistory } from './actions';
import { setFilter } from './store';
import { AppDispatch, RootState } from '@/store';
import Link from 'next/link';

export default function LoyaltyPage() {
    const dispatch = useDispatch<AppDispatch>();

    const { filter, filteredList } = useSelector((state: RootState) => state.loyalty);

    useEffect(() => {
        dispatch(fetchLoyaltyList() as any);
        dispatch(fetchRedemptionHistory() as any);
    }, [dispatch]);

    // Directly update Redux state on input change
    const handleFilterChange = (key: keyof typeof filter, value: string | number) => {
        dispatch(setFilter({ ...filter, [key]: value === '-1' ? null : value }));
    };

    return (
        <div className='card h-100 p-0 radius-12'>
            <div className='card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between'>
                <div className='d-flex align-items-center flex-wrap gap-3'>
                    {/* Filter by Stamps Collected */}
                    <span className='text-md fw-medium text-secondary-light mb-0'>
                        Filter by Stamps
                    </span>
                    <select
                        className='form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px'
                        value={filter.stampsCollected ?? '-1'}
                        onChange={(e) => handleFilterChange('stampsCollected', e.target.value)}
                    >
                        <option value='-1'>None</option>
                        {[...Array(10).keys()].map((n) => (
                            <option key={n + 1} value={n + 1}>
                                {n + 1}
                            </option>
                        ))}
                    </select>

                    {/* Filter by Branch */}
                    <span className='text-md fw-medium text-secondary-light mb-0'>
                        Filter by Branch
                    </span>
                    <select
                        className='form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px'
                        value={filter.branchName ?? '-1'}
                        onChange={(e) => handleFilterChange('branchName', e.target.value)}
                    >
                        <option value='-1'>None</option>
                        <option value='Branch 1'>Branch 1</option>
                        <option value='Branch 2'>Branch 2</option>
                        <option value='Branch 3'>Branch 3</option>
                    </select>

                    {/* Filter by Total Visits */}
                    <span className='text-md fw-medium text-secondary-light mb-0'>
                        Filter by Visits
                    </span>
                    <select
                        className='form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px'
                        value={filter.totalVisits ?? '-1'}
                        onChange={(e) => handleFilterChange('totalVisits', e.target.value)}
                    >
                        <option value='-1'>None</option>
                        {[...Array(10).keys()].map((n) => (
                            <option key={n + 1} value={n + 1}>
                                {n + 1}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Data */}
            <div className='card-body p-24'>
                <div className='table-responsive scroll-sm'>
                    <table className='table bordered-table sm-table mb-0'>
                        <thead>
                            <tr>
                                <th scope='col'>Id</th>
                                <th scope='col'>Name</th>
                                <th scope='col'>Visit Count</th>
                                <th scope='col'>Stamps Collected</th>
                                <th scope='col'>Branch Name</th>
                                <th scope='col' className='text-center'>Redeem History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList?.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.visitCount}</td>
                                    <td>{customer.stampsCollected}</td>
                                    <td>{customer.branchName}</td>
                                    <td className='text-center'>
                                        <Link
                                            href={`/loyalty/redeem_history/${customer.id}`}
                                            className='btn btn-sm btn-primary-600'
                                        >
                                            Check History
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

