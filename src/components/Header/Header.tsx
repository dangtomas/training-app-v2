import HomeButton from "./HomeButton";

export default function Header() {
    return (
        <>
            <div className="fixed top-0 flex w-screen items-center justify-between bg-[#def4d7] p-3">
                <img src="/header-logo.png" className="w-40" />
                <HomeButton />
            </div>
        </>
    );
}