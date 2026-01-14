import { useEffect, useState, useRef } from "react";
import "../styles/DrawDetailsModal.css";
import { db } from "../utils/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import { useStore } from '@nanostores/react';
import { selectedDraw } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation";

export default function DrawDetailsModal() {
    const { t } = useClientTranslation();
    const $drawData = useStore(selectedDraw);
    const { uid } = useUserData();

    const [targetUser, setTargetUser] = useState(null);
    const [creatorName, setCreatorName] = useState(""); 
    
    // Lista do animacji (długa taśma z nazwami)
    const [animationReel, setAnimationReel] = useState([]);
    
    // Tryby: 'loading' -> 'animating' -> 'result' -> 'static'
    const [mode, setMode] = useState("loading");
    
    // Czy animacja ruszyła (do triggerowania CSS)
    const [isSpinning, setIsSpinning] = useState(false);

    // Odkrywanie (Hold to reveal)
    const [isRevealed, setIsRevealed] = useState(false);

    // Stałe do konfiguracji animacji
    const ITEM_HEIGHT = 50; // Wysokość jednego nazwiska w pikselach (musi pasować do CSS)
    const WINNER_INDEX = 30; // Na którym indeksie ma się zatrzymać (im więcej, tym dłużej kręci)

    useEffect(() => {
        if (!$drawData || !uid) {
            setMode("loading");
            return;
        }

        const loadData = async () => {
            // 1. Dane wylosowanej osoby
            const targetUid = $drawData.drawList[uid];
            if (!targetUid) return;
            const targetSnap = await getDoc(doc(db, "users", targetUid));
            const targetData = targetSnap.exists() ? targetSnap.data() : { username: "Unknown" };
            setTargetUser(targetData);

            // 2. Dane twórcy
            const creatorSnap = await getDoc(doc(db, "users", $drawData.createdBy));
            setCreatorName(creatorSnap.exists() ? creatorSnap.data().username : "Unknown");

            // 3. Pobranie uczestników do "taśmy"
            let parts = [];
            for (const pid of $drawData.participantIds) {
                const snap = await getDoc(doc(db, "users", pid));
                if (snap.exists()) parts.push(snap.data());
            }

            // 4. Budowanie taśmy do animacji (Musi być długa i kończyć się zwycięzcą)
            if ($drawData.isNew) {
                const reel = [];
                // Wypełniamy losowymi nazwami przed wynikiem
                for (let i = 0; i < WINNER_INDEX; i++) {
                    const randomPerson = parts[Math.floor(Math.random() * parts.length)];
                    reel.push(randomPerson);
                }
                
                // USTAWIAMY ZWYCIĘZCĘ na konkretnym indeksie (WINNER_INDEX)
                reel.push(targetData); 

                // Dodajemy kilka nazw "po" zwycięzcy, żeby nie było pustki na dole
                for (let i = 0; i < 5; i++) {
                    const randomPerson = parts[Math.floor(Math.random() * parts.length)];
                    reel.push(randomPerson);
                }
                
                setAnimationReel(reel);
                setMode("animating");
                
                // Opóźnienie startu animacji, żeby DOM zdążył się wyrenderować
                setTimeout(() => {
                    setIsSpinning(true);
                }, 100);

            } else {
                // Dla starych losowań
                // (tu też potrzebujemy listy uczestników do widoku statycznego)
                setAnimationReel(parts); // W trybie static użyjemy tego jako zwykłej listy
                setMode("static");
            }
        };

        loadData();
    }, [$drawData, uid]);

    // Obsługa końca animacji (CSS transitionend)
    const handleTransitionEnd = () => {
        // Czekamy chwilę po zatrzymaniu i pokazujemy wynik
        setTimeout(() => {
            setMode("result");
        }, 800);
    };

    const handleClose = async () => {
        if ($drawData?.isNew && uid) {
            try {
                const userRef = doc(db, "users", uid);
                await updateDoc(userRef, { seenDraws: arrayUnion($drawData.id) });
            } catch (e) { console.error(e); }
        }
        selectedDraw.set(null);
        setIsRevealed(false);
        setIsSpinning(false);
    };

    if (!$drawData) return null;

    // --- WIDOK 1: ANIMACJA PŁYNNA (SLOT MACHINE) ---
    if (mode === "animating") {
        // Obliczamy przesunięcie w górę. 
        // Chcemy, aby WINNER_INDEX był na środku kontenera.
        // Kontener ma np. 250px (wysokość). Środek to 125px.
        // Element ma 50px. Środek elementu to 25px.
        // Przesunięcie = (WINNER_INDEX * ITEM_HEIGHT) - (CONTAINER_HEIGHT/2) + (ITEM_HEIGHT/2)
        
        const containerHeight = 250; // Musi pasować do CSS .anim-window
        const translateY = isSpinning 
            ? (WINNER_INDEX * ITEM_HEIGHT) - (containerHeight / 2) + (ITEM_HEIGHT / 2)
            : 0;

        return (
            <div id="ScreenBlur">
                <section id="modalWindow" className="draw-details-modal animation-mode">
                    <h2 className="anim-title">{t("drawing")}</h2>
                    
                    {/* Okno, w którym widać przesuwające się nazwy */}
                    <div className="anim-window">
                        <div className="anim-overlay-top"></div>
                        
                        {/* Pasek wskazujący środek */}
                        <div className="anim-highlight-line"></div>

                        {/* Taśma z nazwami */}
                        <div 
                            className="anim-track" 
                            style={{ 
                                transform: `translateY(-${translateY}px)`,
                                transition: isSpinning ? "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)" : "none"
                            }}
                            onTransitionEnd={handleTransitionEnd}
                        >
                            {animationReel.map((p, i) => (
                                <div key={i} className="anim-item" style={{height: `${ITEM_HEIGHT}px`}}>
                                    {p.username}
                                </div>
                            ))}
                        </div>

                        <div className="anim-overlay-bottom"></div>
                    </div>
                </section>
            </div>
        );
    }

    // --- WIDOK 2: WYNIK ---
    if (mode === "result") {
        return (
            <div id="ScreenBlur">
                <section id="modalWindow" className="draw-details-modal result-mode">
                    <h2 className="result-title fadeIn">{t("youDrew")}</h2>
                    <div className="winner-display fadeInDelay1">
                        <img src={targetUser?.picUrl || "/default.png"} alt="winner" className="winner-avatar" />
                        <h1 className="winner-name">{targetUser?.username}</h1>
                    </div>
                    <div className="result-details fadeInDelay2">
                        <p>{t("budget")} <strong>{$drawData.budget} {$drawData.currency}</strong></p>
                        <p>{$drawData.deadline.toDate().toLocaleDateString()}</p>
                    </div>
                    <button onClick={handleClose} className="btn-glow fadeInDelay3" style={{marginTop: '2rem'}}>
                        {t("understood")}
                    </button>
                </section>
            </div>
        );
    }

    // --- WIDOK 3: STATYCZNY ---
    if (mode === "static") {
        // (Kod bez zmian w stosunku do poprzedniej wersji, skopiuj z poprzedniej odpowiedzi 
        // lub użyj tego skrótu jeśli wiesz co robić. Dla pewności wklejam całość bloku static)
        return (
            <div id="ScreenBlur" onClick={handleClose}>
                <section id="modalWindow" className="draw-details-modal static-mode" onClick={e => e.stopPropagation()}>
                    <p className="created-by">{t("createdBy")}: {creatorName}</p>
                    <h2 className="static-title">{$drawData.title}</h2>
                    <div className="static-info-row">
                        <span>{$drawData.deadline.toDate().toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{$drawData.budget} {$drawData.currency}</span>
                    </div>
                    <div className="target-section">
                        <h3>{t("youDrew")}</h3>
                        <div className="reveal-box">
                            <span className={isRevealed ? "revealed-text" : "hidden-text"}>
                                {isRevealed ? targetUser?.username : "######"}
                            </span>
                            <div 
                                className="eye-icon-wrapper"
                                onMouseDown={() => setIsRevealed(true)}
                                onMouseUp={() => setIsRevealed(false)}
                                onMouseLeave={() => setIsRevealed(false)}
                                onTouchStart={() => setIsRevealed(true)}
                                onTouchEnd={() => setIsRevealed(false)}
                                title={t("holdToReveal")}
                            >
                                👁️
                            </div>
                        </div>
                    </div>
                    <div className="participants-list-section">
                        <h4>{t("participants")}</h4>
                        <div className="static-parts-grid">
                            {animationReel.map((p, idx) => (
                                <div key={idx} className="static-part-item">
                                    <img src={p.picUrl || "/default.png"} alt="u" />
                                    <span>{p.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleClose} className="btn-glow" style={{width: '100%', marginTop: '1rem'}}>
                        {t("understood")}
                    </button>
                </section>
            </div>
        );
    }

    return null;
}