export default function ProvisionalCertificate({ student }) {
  return (
    <div className="certificate page-break">
      <h2>PROVISIONAL CERTIFICATE</h2>

      <p>
        This is to certify that{" "}
        <b>
          {student.firstName} {student.lastName}
        </b>
      </p>

      <p>Roll No: {student.rollNumber}</p>

      <p>Studied in class {student.class}</p>
    </div>
  );
}