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
import { useLocation } from "./useLocation";
import RainRatingSelector from "./rainSelector";

interface BackdropModalProps {
  backdrop?: "transparent" | "blur" | "opaque";
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    name: string;
    rainRating: number;
    location: { lat?: number; lng?: number };
  }) => void;
}

const BackdropModal: React.FC<BackdropModalProps> = ({
  backdrop = "blur",
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [rainRating, setRainRating] = useState(0);
  const { location, loadingLocation, getLocation } = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, rainRating, location };
    if (onSubmit) {
      onSubmit(data);
    }
    onClose();
  };

  return (
    <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(close) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">User Info</ModalHeader>
            <ModalBody>
              <Input
                label="Name"
                placeholder="Enter your name"
                required
                value={name}
                onValueChange={(value) => setName(value)}
              />
              <RainRatingSelector rainRating={rainRating} onSelect={setRainRating} />
              <div className="mt-4">
                <p>Current Location:</p>
                {location.lat && location.lng ? (
                  <p>
                    Lat: {location.lat}, Lng: {location.lng}
                  </p>
                ) : loadingLocation ? (
                  <div className="flex items-center space-x-2">
                    <Spinner size="sm" /> <span>Getting location...</span>
                  </div>
                ) : (
                  <Button variant="light" color="primary" onPress={getLocation}>
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
