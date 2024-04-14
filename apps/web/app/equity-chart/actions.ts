"use server";
import { cookies } from "next/headers";

export async function addNewTracker(formData: FormData) {
  const btcAmount = formData.get("btc-amount") as string;
  const cookie = cookies();
  cookie.set("amount", btcAmount);
}

export async function getSavedTracker() {
  const cookie = cookies();
  return cookie.get("amount");
}
