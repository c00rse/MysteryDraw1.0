import { useState, useEffect } from "react";
import "../styles/Modal.css";
import "../styles/NewDrawModal.css";
import { db } from "../utils/firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import { useStore } from '@nanostores/react';
import { isNewDrawOpen, isParticipantSelectorOpen } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation";
import { performDraw } from "../utils/drawLogic";

/**
 * Pod-komponent FriendSelector (WYDZIELONY NA ZEWNĄTRZ)
 * Odpowiada za wyszukanie znajomych i wyświetlenie ich w formie listy do dodania.
 */
const FriendSelector = ({ isVisible, friendList, participants, onAdd }) => {
    const [friendsData, setFriendsData] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            const data = [];
            for (const fUid of friendList) {
                // Pomijamy osoby, które już są dodane do aktualnego losowania
                if (participants.find(p => p.uid === fUid)) continue;

                const snap = await getDoc(doc(db, "users", fUid));
                if (snap.exists()) {
                    data.push({ uid: fUid, ...snap.data() });
                }
            }
            setFriendsData(data);
        };
        // Pobieramy dane tylko gdy okno jest widoczne
        if (isVisible) fetchFriends();
    }, [isVisible, friendList, participants]);

    if (!isVisible) return null;

    return (
        <div className="friend-selector-overlay" onClick={(e) => { e.stopPropagation(); isParticipantSelectorOpen.set(false); }}>
            <div className="friend-selector-box" onClick={(e) => e.stopPropagation()}>
                <h3>Select friend</h3>
                <ul>
                    {friendsData.length === 0 && <p>No friends to add</p>}
                    {friendsData.map(f => (
                        <li key={f.uid} onClick={() => onAdd(f)}>
                            <img src={f.picUrl || "/default.png"} alt="avatar"/>
                            <span>{f.username}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

/**
 * Komponent NewDrawModal - Serce kreatora losowań.
 */
export default function NewDrawModal() {
    const { t } = useClientTranslation();
    
    // SUBSKRYPCJA STANU GLOBALNEGO (Nano Stores)
    const $isOpen = useStore(isNewDrawOpen);
    const $isSelectorOpen = useStore(isParticipantSelectorOpen);
    
    const { uid, username, picUrl, friendList } = useUserData();

    // LOKALNE STANY FORMULARZA
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [budget, setBudget] = useState("");
    const [currency, setCurrency] = useState("PLN");
    const [participants, setParticipants] = useState([]);

    // STANY PROCESU TWORZENIA
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };
    
    const minDateStr = getMinDate();

    // Resetowanie stanu przy otwarciu
    useEffect(() => {
        if ($isOpen && uid) {
            setTitle("");
            setDate("");
            setBudget("");
            setCurrency("PLN");
            setParticipants([{ uid, username, picUrl }]);
            setIsProcessing(false);
            setProgress(0);
            setIsSuccess(false);
        }
    }, [$isOpen, uid, username, picUrl]);

    const handleAddParticipant = (friend) => {
        if (!participants.find(p => p.uid === friend.uid)) {
            setParticipants([...participants, friend]);
        }
        isParticipantSelectorOpen.set(false);
    };

    const handleRemoveParticipant = (targetUid) => {
        if (targetUid === uid) return; 
        setParticipants(participants.filter(p => p.uid !== targetUid));
    };

    const handleCreateDraw = async () => {
        if (!title || !date || !budget || participants.length < 3) {
            alert("Please fill all fields and add at least 3 participants.");
            return;
        }

        setIsProcessing(true);

        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 5;
            setProgress(currentProgress);
            if (currentProgress >= 90) clearInterval(interval);
        }, 50);

        try {
            const participantIds = participants.map(p => p.uid);
            const drawMap = performDraw(participantIds);

            await addDoc(collection(db, "draws"), {
                title: title,
                budget: Number(budget),
                currency: currency,
                deadline: Timestamp.fromDate(new Date(date)),
                drawList: drawMap,
                participantIds: participantIds,
                createdBy: uid
            });

            clearInterval(interval);
            setProgress(100);
            setTimeout(() => {
                setIsSuccess(true);
            }, 500);

        } catch (error) {
            console.error(error);
            alert("Error creating draw");
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        isNewDrawOpen.set(false);
    };

    if (!$isOpen) return null;

    return (
        <div id="ScreenBlur" onClick={handleClose}>
            <section id="modalWindow" className="new-draw-modal" onClick={(e) => e.stopPropagation()}>
                <FriendSelector 
                    isVisible={$isSelectorOpen}
                    friendList={friendList}
                    participants={participants}
                    onAdd={handleAddParticipant}
                />

                {isSuccess ? (
                    <div className="success-view">
                        <div className="checkmark">✔</div>
                        <h2>{t("drawSuccessTitle")}</h2>
                        <button onClick={handleClose} className="btn-glow">{t("drawSuccessBtn")}</button>
                    </div>
                ) : isProcessing ? (
                    <div className="loading-view">
                        <div className="circular-progress" style={{ background: `conic-gradient(var(--accent-color) ${progress * 3.6}deg, #e0e0e0 0deg)` }}>
                            <div className="inner-circle">{progress}%</div>
                        </div>
                        <p>Drawing in progress...</p>
                    </div>
                ) : (
                    <>
                        <h2>{t("createDrawTitle")}</h2>
                        <div className="form-content">
                            <label>{t("labelDrawTitle")}</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} />

                            <label>{t("labelDate")}</label>
                            <input type="date" min={minDateStr} value={date} onChange={e => setDate(e.target.value)} />

                            <div className="row-inputs">
                                <div>
                                    <label>{t("labelBudget")}</label>
                                    <input type="number" value={budget} onChange={e => setBudget(e.target.value)} />
                                </div>
                                <div>
                                    <label>{t("labelCurrency")}</label>
                                    <input type="text" value={currency} maxLength={3} onChange={e => setCurrency(e.target.value.toUpperCase())} style={{textTransform: 'uppercase'}} />
                                </div>
                            </div>

                            <label style={{marginTop: '1rem'}}>{t("sectionParticipants")}</label>
                            <div className="participants-grid">
                                {participants.map((p) => (
                                    <div key={p.uid} className="participant-bubble">
                                        <div className="avatar-wrapper" onClick={() => handleRemoveParticipant(p.uid)}>
                                            <img src={p.picUrl || "/default.png"} alt="user"/>
                                            <div className="remove-overlay">✕</div>
                                        </div>
                                        <span>{p.username}</span>
                                    </div>
                                ))}
                                <div className="participant-bubble add-btn" onClick={() => isParticipantSelectorOpen.set(true)}>
                                    <div className="avatar-wrapper circle-btn"> + </div>
                                    <span>add</span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={handleCreateDraw} className="btn-glow">{t("btnCreateDraw")}</button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}