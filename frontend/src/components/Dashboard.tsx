import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <h2 className="text-2xl font-bold">Employee Insights Dashboard</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="bg-withe p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Employees</h3>
          <p className="text-3xl font-bold">150</p>
        </div>
        <div className="bg-withe p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Avg. Productivity</h3>
          <p className="text-3xl font-bold">78%</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Burnout Risk</h3>
          <p className="text-3xl font-bold text-red-500">25%</p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold">Productivity Trends</h3>
        {/* <ProductivityChart /> */}
      </div>
    </div>
  );
};
export default Dashboard;
