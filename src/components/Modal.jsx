import { useState } from "react";
import "../styles/Modal.css";
import { db } from "../utils/firebase";
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import { useStore } from '@nanostores/react';
import { isFriendModalOpen } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation";

/**
 * Komponent Modal (Dodawanie znajomych) - Realizuje logikę wyszukiwania użytkowników 
 * w globalnej bazie danych na podstawie adresu e-mail i nawiązywania relacji między nimi.
 */
export default function Modal() {
    const { t } = useClientTranslation();
    
    // Subskrypcja globalnego stanu widoczności modala z Nano Stores
    const $isOpen = useStore(isFriendModalOpen);
    
    // Lokalne stany dla formularza i komunikatów zwrotnych
    const [emailInput, setEmailInput] = useState("");
    const [statusMsg, setStatusMsg] = useState(""); 
    
    // Pobranie danych aktualnego użytkownika z custom hooka
    const { uid, friendList, userEmail } = useUserData();

    /**
     * Czyści formularz i zamyka modal.
     */
    const closeModal = () => {
        setStatusMsg("");
        setEmailInput("");
        isFriendModalOpen.set(false);
    };

    /**
     * Główna funkcja procesująca dodawanie znajomego.
     * Wykorzystuje zapytania filtrujące Firestore (Query).
     */
    const handleAddFriend = async () => {
        if (!emailInput) return;
        setStatusMsg(t("statusSearching"));

        try {
            // WALIDACJA 1: Blokada dodawania własnego adresu e-mail
            if (emailInput.trim() === userEmail) {
                setStatusMsg(t("statusSelfAdd"));
                return;
            }

            // KROK 1: Budowanie zapytania do kolekcji "users"
            // Szukamy dokumentu, w którym pole 'email' jest równe wpisanej wartości
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", emailInput.trim()));
            
            // KROK 2: Wykonanie zapytania (getDocs)
            const querySnapshot = await getDocs(q);

            // WALIDACJA 2: Sprawdzenie, czy jakikolwiek użytkownik został znaleziony
            if (querySnapshot.empty) {
                setStatusMsg(t("statusNotFound"));
                return;
            }

            // Pobieramy pierwszy znaleziony dokument (e-maile są unikalne)
            const friendDoc = querySnapshot.docs[0];
            const friendUid = friendDoc.id;

            // WALIDACJA 3: Sprawdzenie, czy użytkownik nie znajduje się już na liście znajomych
            if (friendList && friendList.includes(friendUid)) {
                setStatusMsg(t("statusAlreadyFriend"));
                return;
            }

            // KROK 3: Aktualizacja bazy danych
            // Pobieramy referencję do dokumentu ZALOGOWANEGO użytkownika
            const currentUserRef = doc(db, "users", uid);
            
            // Wykorzystanie arrayUnion do atomowego dodania ID znajomego do tablicy 'friends'
            await updateDoc(currentUserRef, {
                friends: arrayUnion(friendUid)
            });

            // Poinformowanie o sukcesie i automatyczne zamknięcie okna po krótkiej chwili
            setStatusMsg(t("statusSuccess"));
            setTimeout(closeModal, 1500);

        } catch (error) {
            console.error("Error adding friend:", error);
            setStatusMsg(t("statusError"));
        }
    };

    // Jeśli modal nie jest otwarty w stanie globalnym, nie renderuj nic (Performance)
    if (!$isOpen) return null;

    return (
        /* ScreenBlur - tło modala z efektem rozmycia */
        <div id="ScreenBlur" onClick={closeModal}>
            
            {/* stopPropagation() - zapobiega zamknięciu modala przy kliknięciu wewnątrz jego okna */}
            <section id="modalWindow" onClick={(e) => e.stopPropagation()}>
                <h2>{t("modalAddTitle")}</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                    <input 
                        type="email" 
                        placeholder={t("modalAddInputPlaceholder")}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                    
                    <button onClick={handleAddFriend}>
                        {t("modalAddSubmitBtn")}
                    </button>
                </div>

                {/* Sekcja komunikatów: kolor tekstu dobierany dynamicznie na podstawie treści wiadomości */}
                {statusMsg && (
                    <p style={{ 
                        marginTop: "10px", 
                        color: statusMsg.includes("success") || statusMsg.includes("pomyślnie") ? "green" : "red" 
                    }}>
                        {statusMsg}
                    </p>
                )}
            </section>
        </div>
    );
}