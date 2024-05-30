"use server";
import { cookies } from "next/headers";

export async function addNewTracker(formData: FormData, token: string) {
  const btcAmount = formData.get("btc-amount") as string;
  const res = await fetch("http://localhost:3010/add-tracker", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: btcAmount,
      trackerNumber: 1,
    }),
  });
  if (res.ok) {
    return;
  }
  const { amount } = await res.json();
  const cookie = cookies();
  cookie.set("amount", amount);
}

export async function getSavedTracker() {
  const cookie = cookies();
  return cookie.get("amount");
}

export async function cleanSavedTracker() {
  const cookie = cookies();
  cookie.delete("amount");
}
