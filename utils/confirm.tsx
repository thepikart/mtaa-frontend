import { useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";

export function useConfirmation() {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState<(value: boolean) => void>(() => {});

    const confirm = (msg: string): Promise<boolean> => {
        setMessage(msg);
        setVisible(true);
        return new Promise(resolve => {
            setResponse(() => resolve);
        });
    };

    const handleClose = (confirmed: boolean) => {
        setVisible(false);
        response(confirmed);
    };

    const Confirmation = () => (
        <ConfirmationModal
            message={message}
            visible={visible}
            onClose={handleClose}
        />
    );

    return { confirm, Confirmation };
}
