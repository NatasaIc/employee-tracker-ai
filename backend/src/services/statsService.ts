import Employee from '../models/employeeModel';

// ✅ Fetch admin statistics (Company-wide data)
export const fetchAdminStats = async () => {
  const totalEmployees = await Employee.countDocuments();
  const totalSickDays = await Employee.aggregate([
    { $group: { _id: null, total: { $sum: '$sickLeaves' } } },
  ]);
  const totalSickLeaves = totalSickDays.length > 0 ? totalSickDays[0].total : 0;

  const vacationData = await Employee.aggregate([
    { $group: { _id: null, avgVacationUsed: { $avg: '$vacationToken' } } },
  ]);

  const avgVacationUsed =
    vacationData.length > 0 ? vacationData[0].avgVacationUsed : 0;

  return {
    totalEmployees,
    totalSickDays: totalSickLeaves,
    avgVacationUsed: `${Math.round((avgVacationUsed / 35) * 100)} %`,
  };
};

// ✅ Fetch manager statistics (Team-specific data)
export const fetchManagerStats = async (managerId: string) => {
  const manager = await Employee.findById(managerId);
  if (!manager) throw new Error('Invalid manager ID');

  const teamMembers = await Employee.find({
    department: manager.department,
    userRole: 'employee',
  });
  const totalTeamMembers = teamMembers.length;

  const totalTeamSickDays = teamMembers.reduce(
    (sum, member) => sum + member.sickLeaves,
    0
  );

  const upcomingAnniversaries = teamMembers
    .filter((member) => {
      if (!member.workAnniversary) return false;
      const today = new Date();
      const anniversary = new Date(member.workAnniversary);

      return (
        anniversary.getMonth() === today.getMonth() &&
        anniversary.getDate() >= today.getDate()
      );
    })
    .map((member) => ({
      name: member.name,
      date: member.workAnniversary.toDateString(),
    }));

  return {
    totalTeamMembers,
    teamSickDays: totalTeamSickDays,
    upcomingAnniversaries,
  };
};
