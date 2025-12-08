import { useState } from "react";
import "../styles/Modal.css"; 
import { db } from "../utils/firebase";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import { useStore } from '@nanostores/react';
import { friendToDeleteId } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation"; // IMPORT

export default function ConfirmDeleteModal() {
    const { t } = useClientTranslation(); // UŻYCIE HOOKA
    const $friendId = useStore(friendToDeleteId);
    const { uid } = useUserData();
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        friendToDeleteId.set(null);
    };

    const handleConfirmDelete = async () => {
        if (!uid || !$friendId) return;

        setIsLoading(true);
        try {
            const currentUserRef = doc(db, "users", uid);
            await updateDoc(currentUserRef, {
                friends: arrayRemove($friendId)
            });
            handleClose();
        } catch (error) {
            console.error("Error removing friend:", error);
            alert(t("errorDelete")); // TŁUMACZENIE
        } finally {
            setIsLoading(false);
        }
    };

    if (!$friendId) return null;

    return (
        <div id="ScreenBlur" onClick={handleClose}>
            <section id="modalWindow" onClick={(e) => e.stopPropagation()}>
                <h2 style={{color: '#ff4444'}}>{t("modalDeleteTitle")}</h2> {/* TŁUMACZENIE */}
                <p style={{margin: "20px 0", textAlign: "center"}}>
                    {t("modalDeleteDesc")} {/* TŁUMACZENIE */}
                </p>
                
                <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "20px" }}>
                    <button 
                        onClick={handleClose}
                        style={{ 
                            backgroundColor: "transparent", 
                            border: "1px solid var(--text-color)" 
                        }}
                    >
                        {t("cancel")} {/* TŁUMACZENIE */}
                    </button>

                    <button 
                        onClick={handleConfirmDelete} 
                        disabled={isLoading}
                        style={{
                            backgroundColor: "#ff4444", 
                            color: "white",
                            border: "none"
                        }}
                    >
                        {isLoading ? t("btnDeleting") : t("btnDeleteConfirm")} {/* TŁUMACZENIE */}
                    </button>
                </div>
            </section>
        </div>
    );
}