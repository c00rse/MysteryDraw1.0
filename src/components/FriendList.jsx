import "../styles/FriendList.css";
import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import useUserData from "../scripts/useUserData";

import { isFriendModalOpen, friendToDeleteId, isNewDrawOpen } from "../utils/modalStore";

// Importujemy hook tłumaczeń
import { useClientTranslation } from "../utils/useClientTranslation";

export const FriendList = () => {
    // Inicjalizacja tłumaczeń
    const { t } = useClientTranslation();
    
    // Pobranie danych użytkownika
    const { uid, friendList } = useUserData();
    
    // Lokalny stan do przechowywania danych znajomych
    const [fullFriendsData, setFullFriendsData] = useState([]);

    // Efekt pobierający szczegóły znajomych, gdy zmieni się lista ID (friendList)
    useEffect(() => {
        const fetchFriendDetails = async () => {
            if (friendList && friendList.length > 0) {
                try {
                    // Dla każdego UID w liście pobieramy dokument z kolekcji 'users'
                    const promises = friendList.map(async (friendUid) => {
                        if (!friendUid) return null;
                        const friendDocRef = doc(db, 'users', friendUid);
                        const friendDocSnap = await getDoc(friendDocRef);

                        if (friendDocSnap.exists()) {
                            return { uid: friendUid, ...friendDocSnap.data() };
                        }
                        return null;
                    });

                    // Czekamy na wszystkie zapytania
                    const results = await Promise.all(promises);
                    // Filtrujemy puste wyniki
                    setFullFriendsData(results.filter(item => item !== null));

                } catch (error) {
                    console.error("Error fetching friend details:", error);
                }
            } else {
                setFullFriendsData([]);
            }
        };

        fetchFriendDetails();
    }, [friendList]);

    // Funkcja otwierająca modal potwierdzenia usunięcia
    const openDeleteModal = (e, friendUid) => {
        e.stopPropagation();
        friendToDeleteId.set(friendUid);
    };

    // Sprawdzenie czy użytkownik jest zalogowany
    if (!uid) return null;

    return (
        <section id="FriendList">
            {/* Nagłówek sekcji */}
            <div>
                <h2>{t("friendsHeader")}</h2>
                <h2>{fullFriendsData.length}</h2>
            </div>

            {/* Lista przewijana */}
            <ul>
                {fullFriendsData.map((friend) => (
                    <li key={friend.uid} className="friend-item">
                        <div className="friend-info">
                            <img
                                src={friend.picUrl || "/default.png"}
                                alt="user avatar"
                            />
                            <h3>{friend.username || t("unknownFriend")}</h3>
                        </div>
                        
                        {/* Usuwanie znajomych */}
                        <button 
                            className="delete-btn" 
                            onClick={(e) => openDeleteModal(e, friend.uid)}
                            title={t("modalDeleteTitle")}
                        >
                            ✕
                        </button>
                    </li>
                ))}
                
                <li id="add" onClick={() => isFriendModalOpen.set(true)}>
                    <h3>{t("addFriendBtn")}</h3>
                </li>
            </ul>

            {/* Przycisk New Draw */}
            <div className="new-draw-container">
                <button 
                    className="btn-glow new-draw-btn" 
                    onClick={() => isNewDrawOpen.set(true)}
                >
                    {t("newDrawBtn")}
                </button>
            </div>
        </section>
    );
};
