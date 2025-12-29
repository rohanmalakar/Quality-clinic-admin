'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { fetchRedemptionHistory } from '../../actions';
import { filterRedemptionHistory } from '../../store';
import { AppDispatch, RootState } from '@/store';
import Link from 'next/link';

export default function RedeemHistory() {
    const { customerId } = useParams();
    const dispatch = useDispatch<AppDispatch>();

    const { filteredHistory } = useSelector(
        (state: RootState) => state.redemption
    );

    useEffect(() => {
        // Fetch redemption history and filter it based on customerId
        dispatch(fetchRedemptionHistory()).then(() => {
            dispatch(filterRedemptionHistory(customerId));
        });

    }, [dispatch, customerId]);

    return (
        <div className="card h-100 p-24 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
                <h4 className="mb-0">Redemption History for Customer {customerId}</h4>
                <Link href="/loyalty" className="btn btn-sm btn-primary-600">
                    Back to Loyalty
                </Link>
            </div>
            <div className="card-body">
                {filteredHistory && filteredHistory.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table bordered-table sm-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Booking ID</th>
                                    <th scope="col">Customer ID</th>
                                    <th scope="col">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((history) => (
                                    <tr key={history.bookingId}>
                                        <td>{history.bookingId}</td>
                                        <td>{history.customerId}</td>
                                        <td>{new Date(history.date).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No redemption history found for this customer.</p>
                )}
            </div>
        </div>
    );
}
