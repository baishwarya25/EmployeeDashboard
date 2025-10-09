const express = require("express");
const bodyParser = require("body-parser");
const oracledb = require("oracledb");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// OracleDB connection details
const dbConfig = {
  user: "YOUR_USERNAME",
  password: "YOUR_PASSWORD",
  connectString: "localhost/XEPDB1", // change according to your setup
};

let connection;

async function initDB() {
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log("Connected to OracleDB");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
}
initDB();

// GET all employees
app.get("/api/employees", async (req, res) => {
  try {
    const result = await connection.execute("SELECT * FROM employees");
    res.json(result.rows.map((row) => {
      return result.metaData.reduce((acc, col, i) => {
        acc[col.name] = row[i];
        return acc;
      }, {});
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST add new employee
app.post("/api/employees", async (req, res) => {
  const emp = req.body;
  try {
    await connection.execute(
      `INSERT INTO employees (
        EMP_ID, TYPE, ID_NO, TITLE, NAME, DESIGNATION,
        DIRECTORY, DIVISION, DATE_OF_JOIN, DATE_OF_POST,
        QUALIFICATION, DISCIPLINE, SEX, BLOOD_GROUP,
        PHONE, ADDRESS, PERMANENT_ADDRESS, DOB
      ) VALUES (
        :empId, :type, :idNo, :title, :name, :designation,
        :directory, :division, TO_DATE(:dateOfJoin,'YYYY-MM-DD'),
        TO_DATE(:dateOfPost,'YYYY-MM-DD'), :qualification,
        :discipline, :sex, :bloodGroup, :phone,
        :address, :permanentAddress, TO_DATE(:dob,'YYYY-MM-DD')
      )`,
      {
        empId: emp.empId,
        type: emp.type,
        idNo: emp.idNo,
        title: emp.title,
        name: emp.name,
        designation: emp.designation,
        directory: emp.directory,
        division: emp.division,
        dateOfJoin: emp.dateOfJoin,
        dateOfPost: emp.dateOfPost || null,
        qualification: emp.qualification,
        discipline: emp.discipline,
        sex: emp.sex,
        bloodGroup: emp.bloodGroup,
        phone: emp.phone,
        address: emp.address,
        permanentAddress: emp.permanentAddress,
        dob: emp.dob,
      },
      { autoCommit: true }
    );
    res.json({ message: "Employee added successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update employee
app.put("/api/employees/:id", async (req, res) => {
  const id = req.params.id;
  const emp = req.body;
  try {
    await connection.execute(
      `UPDATE employees SET
        EMP_ID = :empId, TYPE = :type, ID_NO = :idNo, TITLE = :title,
        NAME = :name, DESIGNATION = :designation, DIRECTORY = :directory,
        DIVISION = :division, DATE_OF_JOIN = TO_DATE(:dateOfJoin,'YYYY-MM-DD'),
        DATE_OF_POST = TO_DATE(:dateOfPost,'YYYY-MM-DD'),
        QUALIFICATION = :qualification, DISCIPLINE = :discipline,
        SEX = :sex, BLOOD_GROUP = :bloodGroup, PHONE = :phone,
        ADDRESS = :address, PERMANENT_ADDRESS = :permanentAddress,
        DOB = TO_DATE(:dob,'YYYY-MM-DD')
      WHERE ID = :id`,
      {
        empId: emp.empId,
        type: emp.type,
        idNo: emp.idNo,
        title: emp.title,
        name: emp.name,
        designation: emp.designation,
        directory: emp.directory,
        division: emp.division,
        dateOfJoin: emp.dateOfJoin,
        dateOfPost: emp.dateOfPost || null,
        qualification: emp.qualification,
        discipline: emp.discipline,
        sex: emp.sex,
        bloodGroup: emp.bloodGroup,
        phone: emp.phone,
        address: emp.address,
        permanentAddress: emp.permanentAddress,
        dob: emp.dob,
        id,
      },
      { autoCommit: true }
    );
    res.json({ message: "Employee updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE employee
app.delete("/api/employees/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await connection.execute(`DELETE FROM employees WHERE ID = :id`, { id }, { autoCommit: true });
    res.json({ message: "Employee deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
