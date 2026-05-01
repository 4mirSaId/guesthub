"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminServices() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/service-requests");
        setRequests(res.data);
      } catch (error) {
        console.error("Error fetching service requests:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    setUpdating(prev => ({ ...prev, [id]: true }));
    try {
      const res = await axios.patch(`http://localhost:3001/api/service-requests/${id}`, {
        status,
      });
      // Update the specific request in state
      setRequests(prev =>
        prev.map(r => r._id === id ? res.data : r)
      );
    } catch (error) {
      console.error("Error updating service request:", error);
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600';
      case 'in-progress': return 'bg-blue-600';
      case 'done': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Cleaning': return '🧹';
      case 'Maintenance': return '🔧';
      case 'Food & Drink': return '🍽️';
      default: return '📋';
    }
  };

  return (
    <div className="min-h-screen text-gray-800 p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-emerald-500 mb-2">Service Requests 🛎️</h1>
          <p className="text-gray-500 text-lg">Manage and respond to guest service requests</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16 text-gray-500 text-xl">
            Loading service requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xl bg-gray-50 rounded-2xl border border-gray-100">
            No service requests yet.
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((r) => (
              <div
                key={r._id}
                className="p-8 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 ease-in-out bg-white"
              >
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    {/* Room and Type */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{getTypeIcon(r.type)}</span>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-800">Room {r.room}</h3>
                        <p className="text-gray-600 text-sm font-medium">{r.type}</p>
                      </div>
                    </div>

                    {/* Message */}
                    {r.message && (
                      <p className="text-gray-700 text-base mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {r.message}
                      </p>
                    )}

                    {/* Timestamp */}
                    <p className="text-sm text-gray-400 mt-4">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Status Badge */}
                    <span
                      className="px-4 py-2 rounded-xl text-sm font-medium shadow-sm text-white capitalize"
                      style={{ backgroundColor: getStatusColor(r.status) }}
                    >
                      {r.status}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {r.status !== 'done' && (
                        <>
                          {r.status !== 'in-progress' && (
                            <button
                              onClick={() => updateStatus(r._id, "in-progress")}
                              disabled={updating[r._id]}
                              className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
                            >
                              {updating[r._id] ? "Updating..." : "In Progress"}
                            </button>
                          )}

                          <button
                            onClick={() => updateStatus(r._id, "done")}
                            disabled={updating[r._id]}
                            className="px-6 py-3 rounded-xl transition-all duration-300 ease-in-out text-white font-medium shadow-md hover:shadow-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                          >
                            {updating[r._id] ? "Updating..." : "Mark Done"}
                          </button>
                        </>
                      )}

                      {r.status === 'done' && (
                        <button
                          disabled
                          className="px-6 py-3 rounded-xl text-white font-medium bg-gray-400 cursor-not-allowed"
                        >
                          ✓ Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}