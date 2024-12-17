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
import { Report } from "../../types/report"; // 引入 Report type

interface BackdropModalProps {
  backdrop?: "transparent" | "blur" | "opaque";
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (report: Report) => void; // onSubmit 使用 Report 型別
  user: Report["user"]; // 傳入使用者資訊
}

const BackdropModal: React.FC<BackdropModalProps> = ({
  backdrop = "blur",
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [rainDegree, setRainDegree] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const { location, loadingLocation, getLocation } = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const report: Report = {
      user,
      rainDegree,
      photoUrl: photoUrl || undefined,
      comment: comment || undefined,
      location,
      createdAt: new Date(),
    };

    if (onSubmit) {
      onSubmit(report);
    }
    onClose();
  };

  return (
    <Modal backdrop={backdrop} isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(close) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">Create Report</ModalHeader>
            <ModalBody>
              {/* Rain Degree Selector */}
              <RainRatingSelector rainRating={rainDegree} onSelect={setRainDegree} />

              {/* Photo URL */}
              <Input
                label="Photo URL"
                placeholder="Enter photo URL"
                value={photoUrl}
                onValueChange={(value) => setPhotoUrl(value)}
              />

              {/* Comment */}
              <Input
                label="Comment"
                placeholder="Add a comment"
                value={comment}
                onValueChange={(value) => setComment(value)}
              />

              {/* Location */}
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