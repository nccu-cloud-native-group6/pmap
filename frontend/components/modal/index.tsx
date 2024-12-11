import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "@nextui-org/react";

interface BackdropModalProps {
  backdrop?: "transparent" | "blur" | "opaque";
  isOpen: boolean;
  onClose: () => void;
  autoOpen?: boolean;
}

const BackdropModal: React.FC<BackdropModalProps> = ({
  backdrop = "blur",
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [rainRating, setRainRating] = useState(0);
  const [location, setLocation] = useState<{ lat?: number; lng?: number }>({});
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Error retrieving location", error);
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", { name, rainRating, location });
    onClose();
  };

  return (
    <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(close) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">現在雨有多大？</ModalHeader>
            <ModalBody>
              <Input
                label="Name"
                placeholder="Enter your name"
                required
                value={name}
                onValueChange={(value) => setName(value)}
              />

              <div className="mt-4">
                <p className="mb-2">1~5分：</p>
                <div className="flex space-x-2">
                  {Array.from({ length: 5 }, (_, index) => {
                    const ratingValue = index + 1;
                    const selected = ratingValue <= rainRating;
                    return (
                      <span
                        key={index}
                        onClick={() => setRainRating(ratingValue)}
                        style={{
                          cursor: "pointer",
                          fontSize: "1.5rem",
                          // 若已選擇，顯示彩色(藍色)；未選擇則顯示灰階
                          color: selected ? "#1E90FF" : "black",
                          filter: selected ? "none" : "grayscale(100%)",
                        }}
                      >
                        💧
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <p>取得位置</p>
                {location.lat && location.lng ? (
                  <p>
                    Lat: {location.lat}, Lng: {location.lng}
                  </p>
                ) : loadingLocation ? (
                  <div className="flex items-center space-x-2">
                    <Spinner size="sm" /> <span>Getting location...</span>
                  </div>
                ) : (
                  <Button
                    variant="light"
                    color="primary"
                    onPress={handleGetLocation}
                  >
                    Get Current Location
                  </Button>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={close}>
                Close
              </Button>
              <Button color="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BackdropModal;