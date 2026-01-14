import { useState, useEffect } from "react";
import "../styles/Modal.css"; 
import { db } from "../utils/firebase";
import { doc, updateDoc } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import { useStore } from '@nanostores/react';
import { isNameChangeOpen } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation"; 

/**
 * Komponent NameChangeModal - Odpowiada za wyświetlenie okna dialogowego
 * pozwalającego użytkownikowi na zmianę swojej nazwy wyświetlanej (nicku).
 */
export default function NameChangeModal() {
    const { t } = useClientTranslation();
    
    // Pobranie stanu otwarcia modala z globalnego magazynu Nano Stores
    const $isOpen = useStore(isNameChangeOpen);
    
    // Pobranie danych aktualnie zalogowanego użytkownika
    const { uid, username } = useUserData();
    
    // Lokalny stan dla pola input i wskaźnik ładowania podczas komunikacji z bazą
    const [newName, setNewName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Efekt synchronizujący: Gdy modal zostaje otwarty, ustawiamy w polu tekstowym
     * aktualnie posiadaną przez użytkownika nazwę, aby mógł ją edytować.
     */
    useEffect(() => {
        if ($isOpen && username) {
            setNewName(username);
        }
    }, [$isOpen, username]);

    // Funkcja zamykająca modal poprzez zmianę stanu w Nano Stores
    const handleClose = () => {
        isNameChangeOpen.set(false);
    };

    /**
     * Główna funkcja zapisująca zmiany w bazie danych.
     */
    const handleSave = async () => {
        // Podstawowa walidacja: czy UID istnieje i czy nowa nazwa nie jest pusta
        if (!uid || !newName.trim()) return;

        // Jeśli nazwa jest identyczna z obecną, nie wykonujemy zapytania do bazy
        if (newName === username) {
            handleClose();
            return;
        }

        setIsLoading(true); // Aktywacja stanu ładowania (blokuje przycisk)
        try {
            // Tworzenie referencji do dokumentu użytkownika w kolekcji "users"
            const userDocRef = doc(db, "users", uid);
            
            // AKTUALIZACJA DANYCH:
            // updateDoc zmienia tylko wskazane pole (username), pozostawiając resztę dokumentu nienaruszoną
            await updateDoc(userDocRef, { username: newName.trim() });
            
            handleClose(); // Zamknięcie okna po sukcesie
        } catch (error) {
            console.error("Error name:", error);
            alert(t("errorNameChange"));
        } finally {
            setIsLoading(false); // Wyłączenie stanu ładowania niezależnie od wyniku
        }
    };

    // Renderowanie warunkowe - jeśli stan $isOpen jest fałszywy, komponent nie generuje kodu HTML
    if (!$isOpen) return null;

    return (
        /* ScreenBlur - tło modala. Kliknięcie w nie wywołuje handleClose (zamknięcie) */
        <div id="ScreenBlur" onClick={handleClose}>
            
            {/* stopPropagation() - kluczowa funkcja, która sprawia, że kliknięcie 
                wewnątrz białego okna modala NIE zamyka go (blokuje bąbelkowanie zdarzenia do ScreenBlur)
            */}
            <section id="modalWindow" onClick={(e) => e.stopPropagation()}>
                <h2>{t("modalNameTitle")}</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                    <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t("modalNameInputPlaceholder")}
                        maxLength={20}
                        autoFocus // Automatyczne ustawienie kursora w polu po otwarciu
                    />
                    
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                        <button 
                            onClick={handleClose}
                            style={{ backgroundColor: "transparent", border: "1px solid var(--text-color)" }}
                        >
                            {t("cancel")}
                        </button>

                        <button onClick={handleSave} disabled={isLoading}>
                            {/* Wyświetlanie napisu zależnie od stanu operacji asynchronicznej */}
                            {isLoading ? t("saving") : t("save")}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}