import { motion } from "framer-motion";

export default function ViolationTable({ violations, onView }) {
  return (
    <div className="violations-table glass-card">
      <table>
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>Type</th>
            <th>Speed</th>
            <th>Limit</th>
            <th>Over By</th>
            <th>Time</th>
            <th>Image</th>
          </tr>
        </thead>

        <tbody>
          {violations.length > 0 ? (
            violations.map((v, i) => (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 + i * 0.02 }}
              >
                <td className="vehicle-id">#{v.vehicle_id}</td>
                <td>
                  <span className="vehicle-type">{v.vehicle_type}</span>
                </td>
                <td className="speed-value">{v.speed} mph</td>
                <td>{v.speed_limit} mph</td>
                <td className="over-speed">+{v.over_speed_by} mph</td>
                <td className="timestamp">
                  {new Date(v.timestamp).toLocaleString()}
                </td>
                <td>
                  {v.image_filename ? (
                    <button
                      className="view-btn"
                      onClick={() => onView(v.image_filename)}
                    >
                      View
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="no-data-row">
                No violations recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
