import React from "react";
import { Card, CardBody, CardFooter, Image } from "@nextui-org/react";

interface ReportPopupProps {
  userName?: string;
  rainDegree: number;
  comment?: string;
  photoUrl?: string;
  reportTime?: string;
}

const ReportPopup: React.FC<ReportPopupProps> = ({
  userName,
  rainDegree,
  comment = "N/A",
  photoUrl,
  reportTime,
}) => {
  const formatToLocalTime = (time?: string) => {
    if (!time) return "Unknown time";
    const date = new Date(time);
    return date.toLocaleString();
  };

  return (
    <Card
      style={{
        maxWidth: "250px",
        padding: "$6",
        background: "$backgroundContrast",
      }}
    >
      <CardBody>
        <p style={{ fontSize: "16px", color: "$text", margin: 0 }}>
          {userName}
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "$text",
            marginTop: "$2",
            marginBottom: "$2",
          }}
        >
          <strong>Weather</strong>{" "}
          {rainDegree > 0 ? "💧".repeat(rainDegree) : "☀️"}
        </p>
        {comment && (
          <p
            style={{
              fontSize: "14px",
              color: "$text",
              marginTop: 0,
              marginBottom: "$4",
            }}
          >
            <strong>Comment:</strong> {comment}
          </p>
        )}
        {photoUrl && (
          <Image
            src={photoUrl}
            alt="Report Image"
            style={{ objectFit: "cover", borderRadius: "8px" }}
          />
        )}
      </CardBody>
      <CardFooter>
            <strong>Reported at: {formatToLocalTime(reportTime || new Date().toISOString())}</strong>
      </CardFooter>
    </Card>
  );
};

export default ReportPopup;
