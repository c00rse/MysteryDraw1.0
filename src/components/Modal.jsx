import { useState } from "react";
import "../styles/Modal.css";
import { db } from "../utils/firebase";
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import { useStore } from '@nanostores/react';
import { isFriendModalOpen } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation"; // IMPORT

export default function Modal() {
    const { t } = useClientTranslation(); // UŻYCIE HOOKA
    const $isOpen = useStore(isFriendModalOpen);
    const [emailInput, setEmailInput] = useState("");
    const [statusMsg, setStatusMsg] = useState(""); 
    const { uid, friendList, userEmail } = useUserData();

    const closeModal = () => {
        setStatusMsg("");
        setEmailInput("");
        isFriendModalOpen.set(false);
    };

    const handleAddFriend = async () => {
        if (!emailInput) return;
        setStatusMsg(t("statusSearching")); // TŁUMACZENIE

        try {
            if (emailInput.trim() === userEmail) {
                setStatusMsg(t("statusSelfAdd")); // TŁUMACZENIE
                return;
            }

            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", emailInput.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setStatusMsg(t("statusNotFound")); // TŁUMACZENIE
                return;
            }

            const friendDoc = querySnapshot.docs[0];
            const friendUid = friendDoc.id;

            if (friendList && friendList.includes(friendUid)) {
                setStatusMsg(t("statusAlreadyFriend")); // TŁUMACZENIE
                return;
            }

            const currentUserRef = doc(db, "users", uid);
            await updateDoc(currentUserRef, {
                friends: arrayUnion(friendUid)
            });

            setStatusMsg(t("statusSuccess")); // TŁUMACZENIE
            setTimeout(closeModal, 1500);

        } catch (error) {
            console.error("Error adding friend:", error);
            setStatusMsg(t("statusError")); // TŁUMACZENIE
        }
    };

    if (!$isOpen) return null;

    return (
        <div id="ScreenBlur" onClick={closeModal}>
            <section id="modalWindow" onClick={(e) => e.stopPropagation()}>
                <h2>{t("modalAddTitle")}</h2> {/* TŁUMACZENIE */}
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                    <input 
                        type="email" 
                        placeholder={t("modalAddInputPlaceholder")} // TŁUMACZENIE
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                    
                    <button onClick={handleAddFriend}>
                        {t("modalAddSubmitBtn")} {/* TŁUMACZENIE */}
                    </button>
                </div>

                {statusMsg && (
                    <p style={{ marginTop: "10px", color: statusMsg.includes("success") || statusMsg.includes("pomyślnie") ? "green" : "red" }}>
                        {statusMsg}
                    </p>
                )}
            </section>
        </div>
    );
}