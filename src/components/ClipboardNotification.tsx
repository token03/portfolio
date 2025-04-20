import React, { useEffect, useRef } from "react";
import "./ClipboardNotification.css";

interface ClipboardNotificationProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
}

const ClipboardNotification: React.FC<ClipboardNotificationProps> = ({
  message,
  isVisible,
  onDismiss,
}) => {
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (isVisible) {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      notificationTimeoutRef.current = setTimeout(() => {
        onDismiss();
      }, 2000);
    }

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [isVisible, onDismiss]);

  return (
    <div
      className={`clipboard-notification ${isVisible ? "visible" : ""}`}
      role="alert"
      aria-live="assertive"
    >
      {message}
    </div>
  );
};

export default ClipboardNotification;
