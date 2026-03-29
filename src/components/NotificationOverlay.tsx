import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameNotification } from '../types';

interface NotificationOverlayProps {
  notifications: GameNotification[];
  onClear: (id: string) => void;
}

export const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ notifications, onClear }) => {
  // Limit to 3 notifications
  const visibleNotifications = notifications.slice(-3);

  return (
    <div className="fixed bottom-20 right-4 z-[500] flex flex-col gap-1 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onClear={onClear} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationItem: React.FC<{ notification: GameNotification; onClear: (id: string) => void }> = ({ notification, onClear }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClear(notification.id);
    }, 2500);
    return () => clearTimeout(timer);
  }, [notification.id, onClear]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className={`
        px-4 py-1 text-[10px] font-mono tracking-tight text-right
        ${notification.type === 'levelUp' 
          ? 'text-blue-400/70' 
          : 'text-purple-400/70'}
      `}
    >
      {notification.message}
    </motion.div>
  );
};
