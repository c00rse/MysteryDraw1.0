import "../styles/UserProfile.css";
import useUserData from "../scripts/useUserData";
import { isNameChangeOpen } from "../utils/modalStore";
import { useClientTranslation } from "../utils/useClientTranslation";

export default function UserProfile() {
    const { t } = useClientTranslation();
    const { picUrl, username, loading } = useUserData();

    const openChangeNameModal = () => {
        isNameChangeOpen.set(true);
    };

    if (loading) {
        return <p>{t("loading")}</p>
    }

    return (
        <>
            <img
                src={picUrl || "/default.png"}
                alt="profile picture"
                id="userPic"
            />
            <h3
                onClick={openChangeNameModal}
                style={{ cursor: "pointer" }}
                title={t("changeNickTitle")}
            >
                {username || t("anonymous")} ✎
            </h3>
        </>
    );
}