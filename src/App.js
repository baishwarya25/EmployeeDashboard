import React, { useState } from "react";
import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    empId: "", type: "", idNo: "", title: "", name: "", designation: "",
    directory: "", division: "", dateOfJoin: "", dateOfPost: "",
    qualification: "", discipline: "", sex: "", bloodGroup: "", phone: "",
    address: "", permanentAddress: "", dob: ""
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (!form.name.trim()) return alert("Name is required");
    if (!form.empId.trim()) return alert("Employee ID is required");
    if (!form.phone.match(/^[0-9]{10}$/)) return alert("Enter a valid 10-digit phone number");
    if (!form.dateOfJoin || !form.dob) return alert("Please fill date fields properly");
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editId) {
      setEmployees(employees.map((emp) =>
        emp.id === editId ? { ...form, id: editId } : emp
      ));
      setEditId(null);
    } else {
      setEmployees([...employees, { ...form, id: Date.now() }]);
    }

    setForm(Object.fromEntries(Object.keys(form).map((k) => [k, ""])));
  };

  const handleEdit = (id) => {
    const emp = employees.find((e) => e.id === id);
    setForm(emp);
    setEditId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  const highlightText = (text) => {
    if (!text) return ""; // handle null/undefined
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.toString().split(regex); // convert to string
    return parts.map((part, index) =>
      regex.test(part) ? <span key={index} className="highlight">{part}</span> : part
    );
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <h2 className="title">Employee Management Dashboard</h2>

      <form className="employee-form" onSubmit={handleSubmit}>
        {["empId","type","idNo","name","qualification","bloodGroup","phone","address","permanentAddress"].map((key) => (
          <input
            key={key}
            name={key}
            value={form[key]}
            onChange={handleChange}
            placeholder={key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}
            required
          />
        ))}

        <select name="title" value={form.title} onChange={handleChange} required>
          <option value="">Select Title</option>
          {["Mr.","Ms.","Mrs.","Dr."].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="designation" value={form.designation} onChange={handleChange} required>
          <option value="">Select Designation</option>
          {["Software Engineer","Director","Group Director","Intern"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="directory" value={form.directory} onChange={handleChange} required>
          <option value="">Select Directory</option>
          {["DIT","DOI","DOVI"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="division" value={form.division} onChange={handleChange} required>
          <option value="">Select Division</option>
          {["Development","SDD","CND","Networking"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="discipline" value={form.discipline} onChange={handleChange}>
          <option value="">Select Discipline</option>
          {["Computer Science","Statistics"].map(v => <option key={v}>{v}</option>)}
        </select>

        <select name="sex" value={form.sex} onChange={handleChange} required>
          <option value="">Select Sex</option>
          {["Male","Female","Other"].map(v => <option key={v}>{v}</option>)}
        </select>

        <label>
          Date of Joining:
          <input type="date" name="dateOfJoin" value={form.dateOfJoin} onChange={handleChange} required />
        </label>
        <label>
          Date of Posting:
          <input type="date" name="dateOfPost" value={form.dateOfPost} onChange={handleChange} />
        </label>
        <label>
          Date of Birth:
          <input type="date" name="dob" value={form.dob} onChange={handleChange} required />
        </label>

        <button type="submit" className="submit-btn">
          {editId ? "Update Employee" : "Add Employee"}
        </button>
      </form>

      <h3>Employee Records</h3>

      <input
        type="text"
        placeholder="Search by Name, Employee ID or Designation"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      <div className="table-wrapper">
        {filteredEmployees.length > 0 ? (
          <table className="employee-table">
            <thead>
              <tr>
                {Object.keys(form).map((key) => (
                  <th key={key}>
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  {Object.keys(form).map((key) => (
                    <td key={key}>{highlightText(emp[key])}</td>
                  ))}
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(emp.id)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(emp.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No employees found.</p>
        )}
      </div>
    </div>
  );
}
