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
  Avatar,
} from "@nextui-org/react";

/* hooks */
import { useLocation } from "./useLocation";
import RainRatingSelector from "./rainSelector";

/* types */
import { Report } from "../../types/report";
import { useUser } from "../../contexts/UserContext";

/* components */
import Login from "../login";

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

    const report: Report = {
      user: user || { id: "guest", name: "Guest", email: "guest@example.com", image: "https://via.placeholder.com/150" }, // HACK: 如果 user 為空，使用 Guest
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
          <ModalHeader className="flex flex-row items-center gap-4">
            {/* 使用者頭像 */}
            <Login/>
            {/* 使用者資訊 */}
            <div>
              <p className="text-lg font-semibold">
                {user?.name || "Guest"}
              </p>
              <p className="text-sm text-gray-500">
                {user?.email || "No email available"}
              </p>
            </div>
          </ModalHeader>

          <ModalBody>
            {/* Rain Degree */}
            <RainRatingSelector
              rainRating={rainDegree}
              onSelect={setRainDegree}
            />

            {/* Photo URL */}
            <Input
              label="Photo URL"
              placeholder="Enter photo URL"
              value={photoUrl}
              onValueChange={setPhotoUrl}
            />

            {/* Comment */}
            <Input
              label="Comment"
              placeholder="Add a comment"
              value={comment}
              onValueChange={setComment}
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