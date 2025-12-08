import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";

export const LogOut = () => {

    const logOut = async () => {
        try {
            await signOut(auth);
            console.log("logged out");
            window.location.href = '/';
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <button onClick={logOut}>log out</button>
    )
} 