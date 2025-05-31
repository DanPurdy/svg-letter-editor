import LetterGenerator from "@components/svg-letter-editor";

export default function Home() {
    return (
        <div className="">
            <main className="">
                <LetterGenerator />
            </main>
            <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
        </div>
    );
}
