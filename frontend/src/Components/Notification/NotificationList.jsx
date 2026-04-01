import React, { useEffect, useState } from "react";
import { getNotifications } from "../../services/notificationService";

function NotificationList() {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  return (
    <div>

      <h2>Notifications</h2>

      {notifications.map((n) => (
        <div key={n._id}>
          {n.message}
        </div>
      ))}

    </div>
  );
}

export default NotificationList;