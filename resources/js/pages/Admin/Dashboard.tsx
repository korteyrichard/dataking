import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { PageProps } from '@/types';

interface AdminDashboardProps extends PageProps {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalTransactions: number;
    todayUsers: number;
    todayOrders: number;
    todayTransactions: number;
  };
}

const StatCard = ({ title, value, gradient }: { title: string; value: number | string; gradient: string }) => (
  <div className={`${gradient} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20`}>
    <h3 className="text-sm font-medium text-white/90">{title}</h3>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
}) => {
  const { auth } = usePage<AdminDashboardProps>().props;



  return (
    <AdminLayout
      user={auth?.user}
      header={<h2 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h2>}
    >
      <Head title="Admin Dashboard" />

      <div className="p-6 space-y-10">
        {/* Summary Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Overall Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
            <StatCard title="Total Products" value={stats.totalProducts} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
            <StatCard title="Total Orders" value={stats.totalOrders} gradient="bg-gradient-to-br from-purple-500 to-purple-600" />
            <StatCard title="Total Transactions" value={stats.totalTransactions} gradient="bg-gradient-to-br from-orange-500 to-orange-600" />
          </div>
        </section>

        {/* Today Section */}
        <section>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Today's Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="New Users Today" value={stats.todayUsers} gradient="bg-gradient-to-br from-cyan-500 to-cyan-600" />
            <StatCard title="Orders Today" value={stats.todayOrders} gradient="bg-gradient-to-br from-pink-500 to-pink-600" />
            <StatCard title="Transactions Today" value={stats.todayTransactions} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
          </div>
        </section>


      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
