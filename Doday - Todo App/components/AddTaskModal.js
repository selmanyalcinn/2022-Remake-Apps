import React from "react";
import TaskModal from "./TaskModal";

export default function AddTaskModal({ visible, onClose, onAdd }) {
  return (
    <TaskModal
      visible={visible}
      onClose={onClose}
      onSubmit={onAdd}
      editingTask={null}
    />
  );
}
