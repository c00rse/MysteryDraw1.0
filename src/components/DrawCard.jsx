import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/DrawCard.css";
import { useClientTranslation } from "../utils/useClientTranslation";

export default function DrawCard({ drawData, isFinished }) {
    const { t } = useClientTranslation();
    const { title, deadline, budget, currency, participantIds } = drawData;
    
    // Obliczanie dni do końca
    const deadlineDate = deadline.toDate();
    const now = new Date();
    const diffTime = Math.abs(deadlineDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const formattedDate = deadlineDate.toLocaleDateString();

    // Pobieranie avatarów (max 6)
    const [avatars, setAvatars] = useState([]);
    
    useEffect(() => {
        const fetchAvatars = async () => {
            // Pobierz tylko pierwsze 4 do wyświetlenia
            const idsToFetch = participantIds.slice(0, 4);
            const loaded = [];
            
            for (const uid of idsToFetch) {
                try {
                    const snap = await getDoc(doc(db, "users", uid));
                    if (snap.exists()) {
                        loaded.push(snap.data().picUrl || "/default.png");
                    } else {
                        loaded.push("/default.png");
                    }
                } catch(e) { loaded.push("/default.png"); }
            }
            setAvatars(loaded);
        };
        fetchAvatars();
    }, [participantIds]);

    const extraCount = participantIds.length - 4;

    return (
        <div className={`draw-card ${isFinished ? 'finished' : ''}`}>
            <div className="card-left">
                <h3>{title}</h3>
                <div className="avatars-row">
                    {avatars.map((url, index) => (
                        <img key={index} src={url} className="card-avatar" alt="p" />
                    ))}
                    
                    {/* Jeśli jest więcej niż 4, pokaż kółka +X */}
                    {extraCount > 0 && (
                        <div className="extra-bubbles">
                             {/* Atrapa kółek dla efektu 'nachodzenia' */}
                            <div className="bubble-shadow" style={{left: '0px'}}></div>
                            <div className="bubble-shadow" style={{left: '10px'}}></div>
                            <div className="bubble-text" style={{left: '20px'}}>+{extraCount}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-right">
                <div className="deadline-box">
                    <span className={`date ${isFinished ? 'crossed' : ''}`}>{formattedDate}</span>
                    
                    {isFinished ? (
                        <span className="status-finished">{t("finished")}</span>
                    ) : (
                        <span className="days-left">{diffDays} {t("daysLeft")}</span>
                    )}
                </div>
                
                {!isFinished && (
                    <div className="budget-box">
                        {budget} {currency}
                    </div>
                )}
            </div>
        </div>
    );
}