"use client";

import Link from "next/link";
import { getCookie } from "cookies-next";
import { SetStateAction, useEffect, useState } from "react";
import Training from "@/types/Training";
import User from "@/types/User";
import { generateDateString } from "@/utils/dateHelper";
import calculatePrice from "@/utils/calculatePrice";
import fetchAttendance from "@/utils/fetchAttendance";
import updateAttendance from "@/utils/updateAttendance";
import fetchUser from "@/utils/fetchUser";
import PlayerCardSmall from "../PlayerCards/PlayerCardSmall";
import DeleteTrainingModal from "./deleteTrainingModal";

export default function TrainingCard(training: Training) {
    const [attendanceList, setAttendanceList] = useState<User[]>([]);
    const [showAttendance, setShowAttendance] = useState(false);
    const [isAttended, setIsAttended] = useState(
        training.attendance.includes(getCookie("id")!),
    );
    const [update, setUpdate] = useState(false);
    const [isDeleteModal, setIsDeleteModal] = useState(false);

    useEffect(() => {
        fetchAttendance(training._id).then(async (result) => {
            setIsAttended(result.includes(getCookie("id")!));
            const userAtendancePromises = result.map((id) => fetchUser(id));
            const userAttendance = await Promise.all(userAtendancePromises);
            setAttendanceList(userAttendance);
        });
    }, [update]);

    async function handleYes() {
        const userId = getCookie("id")!;
        let attendance = await fetchAttendance(training._id);
        if (isAttended || attendance.includes(userId)) {
            return;
        }
        attendance.push(userId);
        updateAttendance(attendance, training._id);
        setUpdate((a) => !a);

        setTimeout(async () => {
            attendance = await fetchAttendance(training._id);
            if (!attendance.includes(userId)) {
                alert("Zkus to znova, někde došlo k chybě");
            }
        }, 1000);
    }

    async function handleNo() {
        const userId = getCookie("id")!;
        let attendance = await fetchAttendance(training._id);
        if (!isAttended || !attendance.includes(userId)) {
            return;
        }
        const index = attendance.indexOf(userId);
        attendance.splice(index, 1);
        updateAttendance(attendance, training._id);
        setUpdate((a) => !a);

        setTimeout(async () => {
            attendance = await fetchAttendance(training._id);
            if (attendance.includes(userId)) {
                alert("Zkus to znova, někde došlo k chybě");
            }
        }, 1000);
    }

    return (
        <>
            {isDeleteModal && (
                <DeleteTrainingModal
                    date={training.date}
                    duration={training.duration}
                    trainingId={training._id}
                    setIsDeleteModal={setIsDeleteModal}
                />
            )}
            <div className="box mt-3 items-start pb-2 pt-5">
                <div className="flex w-full justify-between pb-1 pl-5 pr-4">
                    <h1 className="text-2xl font-bold">{training.activity}</h1>
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsDeleteModal(true)}
                            className="pr-2 text-red-500"
                        >
                            smazat
                        </button>
                        <Link href="/" className="pr-2 text-sky-500">
                            upravit
                        </Link>
                    </div>
                </div>
                <h2 className="pb-1 pl-5 text-xl font-bold">
                    {generateDateString(training.date, training.duration)}
                </h2>
                <h3 className="pl-5 text-lg">
                    Kurty: {training.courts} | Standa:{" "}
                    {training.isTrainer ? "✅" : "❌"}
                </h3>
                <h3 className="pl-5 text-lg">
                    Účast: {attendanceList.length} | Na hráče:{" "}
                    {calculatePrice(
                        training.duration,
                        training.courts,
                        training.courtPrice,
                        training.isTrainer,
                        attendanceList.length,
                    )}
                    ,-
                </h3>
                <p className="py-2 pl-5">
                    {training.info ? training.info : "‎"}
                </p>
                <div className="flex w-full items-center justify-between pl-5 pr-4">
                    <button
                        className="text-xl"
                        onClick={() => setShowAttendance((a) => !a)}
                    >
                        <i className="fa-solid fa-circle-chevron-down"></i>
                        <span className="pl-1 underline">účast</span>
                    </button>
                    <div>
                        <button
                            onClick={handleYes}
                            className={`w-16 rounded-sm border-2 border-green-500 ${isAttended ? "bg-green-500 text-white" : "text-green-500"}`}
                        >
                            Ano
                        </button>
                        <button
                            onClick={handleNo}
                            className={`ml-2 w-16 rounded-sm border-2 border-red-500 ${isAttended ? "text-red-500" : "bg-red-500 text-white"}`}
                        >
                            Ne
                        </button>
                    </div>
                </div>
                {showAttendance && (
                    <div className="flex w-full flex-col px-5 pt-4 sm:flex-row sm:flex-wrap">
                        {attendanceList.length === 0 ? (
                            <h3 className="w-full py-2 text-center">
                                Zatím nikdo 😞
                            </h3>
                        ) : (
                            attendanceList.map((user) => {
                                return (
                                    <div
                                        className="basis-1/2 pb-3"
                                        key={user._id}
                                    >
                                        <PlayerCardSmall
                                            name={user.name}
                                            profilePicSrc={user.profilePicSrc}
                                        />
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
