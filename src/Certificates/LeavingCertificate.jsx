export default function LeavingCertificate({ student }) {
  return (
    <div className="certificate">
      <h2 >
        LEAVING CERTIFICATE
      </h2>

      <div >
        Name: {student.firstName} {student.lastName}
      </div>

      <div >
        Roll No: {student.rollNumber}
      </div>

      <div >
        Class: {student.class}
      </div>

      <div >
        DOB: {new Date(student.dateOfBirth).toLocaleDateString()}
      </div>
    </div>
  );
}