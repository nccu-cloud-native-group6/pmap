"use client";

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

/* hooks */
import { useLocation } from "./useLocation";
import RainRatingSelector from "./rainSelector";

/* types */
import { Report } from "../../types/report";
import { useUser } from "../../contexts/UserContext";

interface BackdropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Report) => void;
}

const BackdropModal: React.FC<BackdropModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rainDegree, setRainDegree] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const { location, loadingLocation, getLocation } = useLocation();
  const { user } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("User is not logged in");
      return;
    }

    const report: Report = {
      user, 
      rainDegree,
      location,
      comment: comment || undefined,
      photoUrl: photoUrl || undefined,
      createdAt: new Date(),
    };

    onSubmit(report);
    onClose();
  };

  return (
    <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            Create Report
          </ModalHeader>
          <ModalBody>
            <RainRatingSelector
              rainRating={rainDegree}
              onSelect={setRainDegree}
            />
            <Input
              label="Photo URL"
              placeholder="Enter photo URL"
              value={photoUrl}
              onValueChange={setPhotoUrl}
            />
            <Input
              label="Comment"
              placeholder="Add a comment"
              value={comment}
              onValueChange={setComment}
            />
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
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" type="submit">
              Submit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default BackdropModal;