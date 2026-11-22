import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import DoctorsTable from '../../components/admin/DoctorsTable';
import DoctorAccessRequests from '../../components/admin/DoctorAccessRequests';

const AdminDoctors = () => {
    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Doctor Applications</h1>
                <p className="text-slate-500">Review access requests and verify completed Doctor profiles.</p>
            </div>
            <DoctorAccessRequests />
            <DoctorsTable />
        </AdminLayout>
    );
};

export default AdminDoctors;
