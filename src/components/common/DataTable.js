import React from "react";

const DataTable = ({ columns = [], data = [], onRowClick }) => {
  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="min-w-full divide-y">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick?.(row)}>
              {columns.map(col => (
                <td key={col.key} className="px-4 py-2 text-sm">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
