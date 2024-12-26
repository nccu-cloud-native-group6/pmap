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
  Spinner,
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // 處理中狀態

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // location 未取得時，不允許提交
    if (location.lat === 0 && location.lng === 0) {
      setError("Location must be selected.");
      return;
    }
  
    setIsSubmitting(true); // 設置處理中狀態
  
    if (!user) {
      setError("User must be logged in to submit a report."); // should never happen
      setIsSubmitting(false);
      return;
    }

    const report: Report = {
      user: user,
      rainDegree,
      location,
      comment: comment || undefined,
      photoUrl: photoUrl || undefined,
      createdAt: new Date(),
    };
  
    try {
      // 呼叫 handleSubmitData 發送 API 請求並更新地圖
      await onSubmit(report);
  
      console.log("Report submitted successfully:", report);
      setIsSubmitting(false); // 結束處理中狀態
      onClose(); // 關閉模態框
    } catch (error) {
      console.error("Error submitting report:", error);
      setError("Failed to submit the report. Please try again.");
      setIsSubmitting(false); // 結束處理中狀態
    }
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
        {isSubmitting ? (
            <ModalBody>
            <Spinner size="lg" className="w-full" style={{ height: "400px" }} />
            </ModalBody>
        ) : user ? (
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
