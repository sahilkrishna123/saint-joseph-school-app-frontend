export default function CharacterCertificate({ student }) {
  return (
    <div className="certificate">
      <h2 >
        CHARACTER CERTIFICATE
      </h2>

      <div >
        {student.firstName} {student.lastName} bears good moral character.
      </div>

      <div >
        Roll No: {student.rollNumber}
      </div>
    </div>
  );
}