"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { addNewTracker } from "./actions";
import { useAuth } from "@clerk/nextjs";

const SATOSHI_TO_BTC = 100_000_000;

export const AddButton = () => {
  const [showDialog, setShowDialog] = useState(false);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  const { getToken } = useAuth();

  async function addNewTrackerAndCloseCb(formData: FormData) {
    const token = await getToken();
    if (!token) {
      alert("non sei auth");
      return;
    }
    await addNewTracker(formData, token);
    close();
    formRef.current!.reset();
  }

  function resetAndCloseCb() {
    formRef.current!.reset();
    close();
  }

  const buttonStyle = {
    padding: "10px 20px",
    borderRadius: "20px",
  } as const;
  const floatButtonStyle = {
    ...buttonStyle,
    position: "fixed",
    right: "6rem",
    bottom: "3rem",
  } as const;
  return (
    <>
      <dialog open={showDialog}>
        <div
          style={{
            width: "33%",
            left: "33%",
            top: "33%",
            background: "rgb(11, 114, 133)",
            border: "1px solid gray",
            borderRadius: "20px",
            padding: "20px",
            position: "fixed",
          }}
        >
          <form
            action={addNewTrackerAndCloseCb}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
            ref={formRef}
          >
            <div>
              <h3>Aggiungi una posizione di BTC da tracciare</h3>
            </div>
            <div>
              <label htmlFor="btc-amount">BTC: </label>
              <input
                id="btc-amount"
                name="btc-amount"
                type="number"
                step={1 / SATOSHI_TO_BTC}
              />
            </div>
            <div style={{ alignSelf: "flex-end", display: "flex", gap: 20 }}>
              <button
                type="submit"
                disabled={pending}
                aria-disabled={pending}
                style={buttonStyle}
              >
                OK
              </button>
              <button
                type="reset"
                disabled={pending}
                aria-disabled={pending}
                style={buttonStyle}
                onClick={resetAndCloseCb}
              >
                Annulla
              </button>
            </div>
          </form>
        </div>
      </dialog>
      <button style={floatButtonStyle} onClick={open}>
        +
      </button>
    </>
  );
};
