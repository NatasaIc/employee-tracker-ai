import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface EmployeeData {
  id: number;
  name: string;
  role: string;
  productivityScore: number;
  workHours: number;
  sickLeaves: number;
  bournoutRisk: string;
}

const EmployeeInsights: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const festchEmployeeData = async () => {
      try {
        const response = await axios.get<EmployeeData[]>(
          `/api/insights/productivity/${employeeId}`
        );
        setEmployees(response.data);
      } catch (error) {
        setError('Failed to fetch employee data.');
      } finally {
        setLoading(false);
      }
    };
    festchEmployeeData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="employee-insights">
      <h2>Employee Insights</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Productivity Score</th>
            <th>Work Hours</th>
            <th>Sick Leaves</th>
            <th>Bournout Risk</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emplyee) => (
            <tr key={emplyee.id}>
              <td>{emplyee.name}</td>
              <td>{emplyee.role}</td>
              <td>{emplyee.productivityScore}</td>
              <td>{emplyee.workHours}</td>
              <td>{emplyee.sickLeaves}</td>
              <td
                className={`burnout-risk ${emplyee.bournoutRisk.toLocaleLowerCase()}`}
              >
                {emplyee.bournoutRisk}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeInsights;
