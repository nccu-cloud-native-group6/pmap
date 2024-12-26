"use client";

import React, { useState, useEffect } from "react";

/* next-ui */
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";

/* hooks */
import RainRatingSelector from "./rainSelector";

/* components */
import Login from "../login";
import Location from "./location";
import LoginPage from "../bookmark/LoginPage";
import PhotoUpload from "./PhotoUpload";

/* types */
import { Report } from "../../types/report";
import { useUser } from "../../contexts/UserContext";
import { useLocation } from "./useLocation";

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
  const [currentTime, setCurrentTime] = useState<string>(""); // 新增時間狀態
  const { location, setLocation, loadingLocation, error, getLocation } =
    useLocation();
  const { user } = useUser();
  const [modalError, setError] = useState<string | null>(null);

  useEffect(() => {
    // 更新當前時間
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString()); // 格式化為本地時間
    }, 1000);

    return () => clearInterval(interval); // 清除定時器
  }, []);

  useEffect(() => {
    if (location.lat !== 0 || location.lng !== 0) {
      setError(null);
    }
  }, [location]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // location 未取得時，不允許提交
    if (location.lat === 0 && location.lng === 0) {
      setError("Location must be selected.");
      return;
    }

    const report: Report = {
      user: user || {
        id: "guest",
        name: "Guest",
        email: "guest@example.com",
        image: "https://via.placeholder.com/150",
      },
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
    <Modal
      backdrop="blur"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      hideCloseButton={true}
    >
      <ModalContent>
        {user ? (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col items-start gap-2">
              <div className="flex flex-row items-center gap-4">
                <Login />
                <div>
                  <p className="text-lg font-semibold">
                    {user?.name || "Guest"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email || "No email available"}
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody>
            {modalError && (
                <p color="error" className="text-sm text-red-500">
                  {modalError}
                </p>
              )}
              <Location
                location={location}
                setLocation={setLocation}
                loadingLocation={loadingLocation}
                onGetLocation={getLocation}
                error={error}
              />
              <div>
                <p className="text">{currentTime}</p>
              </div>
              <RainRatingSelector
                rainRating={rainDegree}
                onSelect={setRainDegree}
              />

<PhotoUpload photoUrl={photoUrl} setPhotoUrl={setPhotoUrl} />


              <Input
                label="Comment"
                placeholder="Add a comment"
                value={comment}
                onValueChange={setComment}
              />
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                Submit
              </Button>
            </ModalFooter>
          </form>
        ) : (
          <ModalBody>
            <LoginPage isInModal />
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BackdropModal;