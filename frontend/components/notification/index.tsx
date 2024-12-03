import {Badge, Button} from "@nextui-org/react";
import { NotificationIcon } from "./notificationIcon";

export default function Notification() {
  return (
    <Badge content="9" shape="circle" color="danger">
      <Button
        radius="full"
        isIconOnly
        aria-label="more than 99 notifications"
        variant="light"
      >
        <NotificationIcon size={24} />
      </Button>
    </Badge>
  );
}