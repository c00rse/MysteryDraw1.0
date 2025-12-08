import { useState, useEffect } from "react";
import "../styles/Modal.css"; 
import { db } from "../utils/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import { useStore } from '@nanostores/react';
import { isNameChangeOpen } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation"; // IMPORT

export default function NameChangeModal() {
    const { t } = useClientTranslation(); // UŻYCIE HOOKA
    const $isOpen = useStore(isNameChangeOpen);
    const { uid, username } = useUserData();
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if ($isOpen && username) {
            setNewName(username);
        }
    }, [$isOpen, username]);

    const handleClose = () => {
        isNameChangeOpen.set(false);
    };

    const handleSave = async () => {
        if (!uid || !newName.trim()) return;
        if (newName === username) {
            handleClose();
            return;
        }

        setIsLoading(true);
        try {
            const userDocRef = doc(db, "users", uid);
            await updateDoc(userDocRef, { username: newName.trim() });
            handleClose();
        } catch (error) {
            console.error("Error name:", error);
            alert(t("errorNameChange")); // TŁUMACZENIE
        } finally {
            setIsLoading(false);
        }
    };

    if (!$isOpen) return null;

    return (
        <div id="ScreenBlur" onClick={handleClose}>
            <section id="modalWindow" onClick={(e) => e.stopPropagation()}>
                <h2>{t("modalNameTitle")}</h2> {/* TŁUMACZENIE */}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t("modalNameInputPlaceholder")} // TŁUMACZENIE
                        maxLength={20}
                        autoFocus
                    />
                    
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button 
                            onClick={handleClose}
                            style={{ backgroundColor: "transparent", border: "1px solid var(--text-color)" }}
                        >
                            {t("cancel")} {/* TŁUMACZENIE */}
                        </button>

                        <button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? t("saving") : t("save")} {/* TŁUMACZENIE */}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}