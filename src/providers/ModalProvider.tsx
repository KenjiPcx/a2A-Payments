import { createContext, useContext, useState, ReactNode } from "react";
import { UpdateStatusModal } from "@/components/modals/UpdateStatusModal";

interface ModalContextType {
  openUpdateStatus: (email: string, currentStatus: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [modalData, setModalData] = useState<{ email: string; status: string }>(
    { email: "", status: "" }
  );

  const openUpdateStatus = (email: string, currentStatus: string) => {
    setModalData({ email, status: currentStatus });
    setIsUpdateStatusOpen(true);
  };

  return (
    <ModalContext.Provider value={{ openUpdateStatus }}>
      {children}
      <UpdateStatusModal
        isOpen={isUpdateStatusOpen}
        onClose={() => setIsUpdateStatusOpen(false)}
        email={modalData.email}
        currentStatus={modalData.status}
      />
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
