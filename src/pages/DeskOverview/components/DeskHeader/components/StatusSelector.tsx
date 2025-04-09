import React from "react";
import { DeskStatus, StatusSelectorProps } from "../types";

const StatusSelector: React.FC<StatusSelectorProps> = ({
  currentStatus,
  statusMenuOpen,
  toggleStatusMenu,
  statusButtonRef,
}) => {
  // Получение цвета маркера в зависимости от статуса
  const getStatusColor = (status: DeskStatus) => {
    switch (status) {
      case DeskStatus.INACTIVE:
        return "bg-gray-400";
      case DeskStatus.IN_PROGRESS:
        return "bg-green-500";
      case DeskStatus.AT_RISK:
        return "bg-yellow-400";
      case DeskStatus.PAUSED:
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="relative" ref={statusButtonRef}>
      <button
        className="flex items-center justify-between min-w-[150px] px-6 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-base cursor-pointer transition-colors"
        onClick={toggleStatusMenu}
      >
        <div className="flex items-center">
          <span
            className={`w-3 h-3 ${getStatusColor(currentStatus)} rounded-full mr-3 flex-shrink-0`}
          ></span>
          <span className="mr-2 whitespace-nowrap">{currentStatus}</span>
        </div>
        <svg
          className={`w-5 h-5 transition-colors flex-shrink-0`}
          style={
            statusMenuOpen
              ? { color: "var(--theme-color)" }
              : { color: "#a0aec0" }
          }
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
};

export default StatusSelector;
