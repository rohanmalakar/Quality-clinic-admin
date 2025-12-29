'use client';

import { get } from "@/utils/network";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import AddNotificationLayer from "./component/addNotiofication";
import { Notification } from "@/utils/types";


const Dashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await get("/notification/all");
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = (notification: Notification) => {
    setNotifications((state) => [...state, notification]);
    setShowCreateNotificationModel(false);
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

    const [showCreateNotification, setShowCreateNotificationModel ] = useState(false);
    return (
      <>
      <Modal show={showCreateNotification} size="lg" onHide={() => setShowCreateNotificationModel(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Notification </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddNotificationLayer onSuccess={onSuccess} />
        </Modal.Body>
      </Modal>
  
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      <button
          onClick={() => setShowCreateNotificationModel(true)}
          className='btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2'
        >
          <Icon
            icon='ic:baseline-plus'
            className='icon text-xl line-height-1'
          />
          Add Notification
        </button>
      </div>
      <div className="card-body p-24">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">Message (English)</th>
                <th scope="col">Message (Arabic)</th>
                <th scope="col">Scheduled Time</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <tr key={index}>
                    <td>{notification.message_en}</td>
                    <td className="text-right">{notification.message_ar}</td>
                    <td>{new Date(notification.scheduled_timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-2">
                    No notifications available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
