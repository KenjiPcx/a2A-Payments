import { motion } from "framer-motion";

const calculateDaysUntilLaunch = () => {
  const launchDate = new Date("2025-01-25");
  const today = new Date();
  const diffTime = launchDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const totalSeats = 120;

interface StatsProps {
  builderSignups: number;
}

export const Stats = ({ builderSignups }: StatsProps) => {
  const daysUntilLaunch = calculateDaysUntilLaunch();
  const stats = [
    { label: "Builder Signups", value: builderSignups.toString() },
    {
      label: "Seats Remaining",
      value: (totalSeats - builderSignups).toString(),
    },
    { label: "Countdown to launch", value: `${daysUntilLaunch} days` },
  ];
  return (
    <div className="flex flex-wrap gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="stat-label">{stat.label}</span>
          <span className="stat-value">{stat.value}</span>
        </motion.div>
      ))}
    </div>
  );
};
