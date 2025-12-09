import React, { useContext, useState } from "react";
import { DataContext } from "../layout/DataContext";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Violations() {
  const data = useContext(DataContext);
  const [searchTerm, setSearchTerm] = useState("");

  if (!data) return <p>Loading...</p>;

  const { violations } = data;

  const filteredViolations = violations.filter((v) =>
    v.vehicle_id.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="violations-content"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="violations-header">
        <div>
          <h1 className="vio-title">Violations</h1>
          <p className="subtitle">All recorded traffic violations</p>
        </div>

        {/* Search Box */}
        <div className="search-box glass-card">
          <Search size={20} color="#fff" />
          <input
            type="text"
            placeholder="Search by Vehicle ID..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
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
            {filteredViolations.length > 0 ? (
              filteredViolations.map((v, index) => (
                <tr key={index}>
                  <td>#{v.vehicle_id}</td>

                  <td>
                    <span className="tag">{v.vehicle_type}</span>
                  </td>

                  <td className="red">{v.speed} mph</td>

                  <td>{v.speed_limit} mph</td>

                  <td className="yellow">+{v.over_speed_by} mph</td>

                  <td>{new Date(v.timestamp).toLocaleString()}</td>

                  <td>
                    {v.image_filename ? (
                      <button
                        className="view-btn"
                        onClick={() =>
                          window.open(
                            `http://localhost:5000/api/images/${v.image_filename}`
                          )
                        }
                      >
                        View
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px" }}>
                  No violations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
