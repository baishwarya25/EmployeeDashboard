import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trash2, X, Search, Edit, UserPlus, Save } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const initialEmployees = [];

const AppAlert = ({ message, type, onConfirm, onCancel }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
        <h3
          className={`text-xl font-bold mb-4 ${
            type === "error"
              ? "text-red-600"
              : type === "confirm"
              ? "text-amber-600"
              : "text-indigo-600"
          }`}
        >
          {type === "confirm"
            ? "Confirm Action"
            : type === "error"
            ? "Error"
            : "Success"}
        </h3>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          {type === "confirm" && (
            <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-lg">
              Cancel
            </button>
          )}
          <button
            onClick={type === "confirm" ? onConfirm : onCancel}
            className={`px-4 py-2 text-white rounded-lg ${
              type === "error"
                ? "bg-red-600"
                : type === "confirm"
                ? "bg-amber-500"
                : "bg-indigo-600"
            }`}
          >
            {type === "confirm" ? "Proceed" : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Employee = () => {
  const emptyForm = {
    empId: "",
    type: "",
    idNo: "",
    title: "",
    name: "",
    designation: "",
    directory: "",
    division: "",
    dateOfJoin: "",
    dateOfPost: "",
    qualification: "",
    discipline: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    address: "",
    permanentAddress: "",
    dob: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState({});
  const [editId, setEditId] = useState(null);
  const [employees, setEmployees] = useState(initialEmployees);
  const [alertState, setAlertState] = useState({ message: null, type: null });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const BASE_URL = "http://localhost:8080/api/employees";

  const [directories, setDirectories] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const showAlert = (msg, type = "success", onConfirm = null, onCancel = null) => {
    setAlertState({ message: msg, type, onConfirm, onCancel });
  };

  const closeAlert = () => setAlertState({ message: null, type: null });

  // 👉 Dynamic dropdown handler
  const handleChange = async (e) => {
    let { name, value } = e.target;

    if (["empId", "idNo", "phone"].includes(name)) {
      value = value.replace(/\D/g, "");
    }
    if (name === "empId" && value.length > 8) return;
    if (name === "idNo" && value.length > 4) return;
    if (name === "phone" && value.length > 10) return;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "directory") {
      setForm((prev) => ({ ...prev, division: "" }));

      if (value) {
        try {
          const res = await axios.get(`${BASE_URL}/divisions/${value}`);
          setDivisions(res.data);
        } catch {
          console.error("Error loading divisions");
        }
      } else {
        setDivisions([]);
      }
    }
  };

  const validateForm = () => {
    if (!/^[0-9]{8}$/.test(form.empId))
      return showAlert("Employee ID must be exactly 8 digits", "error");
    if (!/^[0-9]{4}$/.test(form.idNo))
      return showAlert("ID Number must be exactly 4 digits", "error");
    if (!/^[0-9]{10}$/.test(form.phone))
      return showAlert("Phone must be 10 digits", "error");
    if (!form.name) return showAlert("Full Name is required", "error");
    return true;
  };

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL);
      setEmployees(res.data || []);
    } catch {
      showAlert("Failed to load employee records.", "error");
    }
  }, []);

  // 👉 Load directories from backend
  const fetchDirectories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/directories`);
      setDirectories(res.data);
    } catch {
      console.error("Error loading directories");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDirectories();
  }, [fetchEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedTouched = {};
    fields.forEach((f) => f.required && (updatedTouched[f.key] = true));
    setTouched(updatedTouched);

    if (!validateForm()) return;

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/${editId}`, form);
        showAlert("Employee updated successfully!");
      } else {
        await axios.post(`${BASE_URL}/add`, form);
        showAlert("Employee added successfully!");
      }
      setForm(emptyForm);
      setTouched({});
      setEditId(null);
      fetchEmployees();
    } catch {
      showAlert("Error saving employee.", "error");
    }
  };

  const handleEdit = (id) => {
    const emp = employees.find((e) => e.empId === id);
    setForm(emp);
    setEditId(id);

    axios.get(`${BASE_URL}/divisions/${emp.directory}`).then((res) => {
      setDivisions(res.data);
    });
  };

  const handleDelete = (id) => {
    showAlert("Are you sure?", "confirm", async () => {
      await axios.delete(`${BASE_URL}/${id}`);
      fetchEmployees();
      showAlert("Employee deleted.");
    }, closeAlert);
  };

  const exportToPDF = () => {
    if (!employees.length) return;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
    doc.setFontSize(14);
    doc.text("Employee Report", 40, 40);

    const headers = fields.map((f) => f.label);
    const rows = employees.map((e) => fields.map((f) => e[f.key] || ""));

    autoTable(doc, { head: [headers], body: rows, startY: 60 });
    doc.save("Employee_Report.pdf");
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(employees);
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "EmployeeData.xlsx");
  };

  const filtered = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.empId?.includes(searchTerm)
  );

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fields = [
    { key: "empId", label: "Employee ID", required: true },
    { key: "type", label: "Type", type: "select", required: true, options: ["Staff", "Contract"] },
    { key: "idNo", label: "ID Number", required: true },
    { key: "title", label: "Title", type: "select", required: true, options: ["Mr.", "Ms.", "Mrs.", "Dr."] },
    { key: "name", label: "Full Name", required: true },
    { key: "designation", label: "Designation", type: "select", required: true, options: ["Software Engineer", "Director", "Group Director", "Intern"] },

    //  🔥 Updated Dynamic Dropdowns Here
    {
      key: "directory",
      label: "Directory",
      type: "select",
      required: true,
      options: directories,
    },
    {
      key: "division",
      label: "Division",
      type: "select",
      required: true,
      options: divisions,
    },

    { key: "dateOfJoin", label: "Date of Joining", type: "date", required: true },
    { key: "dateOfPost", label: "Date of Present Post", type: "date" },
    { key: "qualification", label: "Qualification" },
    { key: "discipline", label: "Discipline", type: "select", options: ["Computer Science", "Statistics"] },
    { key: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Other"] },
    { key: "bloodGroup", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    { key: "phone", label: "Phone (10 digits)", required: true },
    { key: "address", label: "Address (Current)", required: true },
    { key: "permanentAddress", label: "Permanent Address", required: true },
    { key: "dob", label: "Date of Birth", type: "date", required: true },
  ];

  return (
    <div className="max-w-8xl mx-auto my-8 p-6 lg:p-10 bg-white rounded-3xl shadow-2xl shadow-indigo-100/50">
      <h1 className="text-4xl font-extrabold text-indigo-700 text-center mb-12">
        Employee Registration
      </h1>

      <form className="mb-12 bg-gray-50 p-6 rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-200/50" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="font-semibold mb-1.5">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "select" ? (
                <select
                  name={field.key}
                  value={form[field.key]}
                  onChange={handleChange}
                  disabled={field.key === "division" && !form.directory}
                  className="p-3 rounded-lg border border-gray-300"
                  required={field.required}
                >
                  <option value="">-- Select {field.label} --</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.key}
                  type={field.type || "text"}
                  value={form[field.key]}
                  onChange={handleChange}
                  min={field.key === "dateOfPost" ? form.dateOfJoin : ""}
                  disabled={editId && field.key === "empId"}
                  className="p-3 rounded-lg border border-gray-300"
                  required={field.required}
                />
              )}

              {field.required && touched[field.key] && !form[field.key] && (
                <span className="text-red-500 text-xs mt-1">* This field is required</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl flex items-center">
            {editId ? (
              <>
                <Save size={20} className="mr-2"/> Update Record
              </>
            ) : (
              <>
                <UserPlus size={20} className="mr-2"/> Save Record
              </>
            )}
          </button>

          {editId && (
            <button type="button" onClick={() => { setForm(emptyForm); setEditId(null); setTouched({}); }} className="bg-gray-300 px-6 py-3 rounded-xl">
              <X className="inline-block mr-2" size={18}/> Cancel Edit
            </button>
          )}

          <button type="button" onClick={() => { setForm(emptyForm); setTouched({}); }} className="bg-yellow-300 px-6 py-3 rounded-xl">
            Clear
          </button>
        </div>
      </form>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input
            type="text"
            placeholder="Search by name or ID..."
            className="w-full p-4 pl-12 rounded-xl border border-gray-300 shadow-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button onClick={exportToExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700">
            Export Excel
          </button>
          <button onClick={exportToPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700">
            Export PDF
          </button>
        </div>
      </div>

      <div className="relative max-h-[400px] overflow-y-auto overflow-x-auto rounded-xl shadow-2xl border border-indigo-100">
        <table className="w-full min-w-[1800px] text-left">
          <thead className="bg-indigo-700 text-white sticky top-0 z-10">
            <tr>
              {fields.map((f) => (
                <th key={f.key} className="p-4 text-sm font-bold">{f.label}</th>
              ))}
              <th className="p-4 text-sm font-bold text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length ? (
              paginated.map((emp) => (
                <tr key={emp.empId} className="hover:bg-indigo-100 transition">
                  {fields.map((f) => (
                    <td key={f.key} className="p-3 border">{emp[f.key]}</td>
                  ))}
                  <td className="p-3 text-center">
                    <button onClick={() => handleEdit(emp.empId)} className="bg-blue-500 text-white px-3 py-1 rounded-md mr-2">
                      <Edit size={14}/>
                    </button>
                    <button onClick={() => handleDelete(emp.empId)} className="bg-red-500 text-white px-3 py-1 rounded-md">
                      <Trash2 size={14}/>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={fields.length + 1} className="text-center p-8 text-indigo-600 font-semibold">
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 mt-6">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-40">
          Prev
        </button>

        <span className="font-bold">Page {currentPage}</span>

        <button disabled={currentPage * itemsPerPage >= filtered.length} onClick={() => setCurrentPage((prev) => prev + 1)} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-40">
          Next
        </button>
      </div>

      <AppAlert {...alertState} onCancel={closeAlert}/>
    </div>
  );
};

export default Employee;
